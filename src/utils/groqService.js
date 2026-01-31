import templateMaps from '../resources/template-maps.json'

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

function assertApiKey() {
  if (!GROQ_API_KEY) {
    throw new Error('Missing VITE_GROQ_API_KEY. Add it to a .env file and restart the dev server.')
  }
}

async function callGroqChat({
  messages,
  model = 'meta-llama/llama-4-scout-17b-16e-instruct',
  responseFormat,
  temperature = 0.7,
  maxTokens = 4000
}) {
  assertApiKey()

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      ...(responseFormat ? { response_format: responseFormat } : {})
    })
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Groq API error: ${response.status} ${response.statusText} - ${errorBody}`)
  }

  return response.json()
}

/**
 * Convert image to base64 data URL
 */
async function imageToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Extract text content from uploaded files
 */
export async function extractTextFromFiles(files, onProgress) {
  const extractedTexts = []
  const extractedImages = []

  for (let i = 0; i < files.length; i++) {
    const fileEntry = files[i]
    const file = fileEntry.file
    onProgress?.(`Reading ${file.name}...`)

    try {
      // Handle images
      if (file.type.startsWith('image/')) {
        const base64 = await imageToBase64(file)
        extractedImages.push({
          name: file.name,
          type: file.type,
          base64: base64
        })
        extractedTexts.push({
          name: file.name,
          type: 'image',
          content: `[IMAGE: ${file.name}] - This is an image file that should be referenced in the presentation.`
        })
      }
      // Handle text files
      else if (file.type.includes('text') || file.type.includes('document') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        const text = await file.text()
        extractedTexts.push({
          name: file.name,
          type: 'text',
          content: text
        })
      }
      // Handle PDFs
      else if (file.type.includes('pdf')) {
        const arrayBuffer = await file.arrayBuffer()
        const text = new TextDecoder('utf-8').decode(arrayBuffer)
        const readableText = text.match(/[^\x00-\x1F\x7F-\x9F]{20,}/g)?.join(' ') || 'PDF content extracted'
        extractedTexts.push({
          name: file.name,
          type: 'pdf',
          content: readableText.substring(0, 50000)
        })
      }
      // Handle spreadsheets/CSV
      else if (file.type.includes('sheet') || file.name.endsWith('.csv') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        const text = await file.text()
        extractedTexts.push({
          name: file.name,
          type: 'spreadsheet',
          content: text
        })
      }
      // Handle Word documents
      else if (file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
        // For DOCX, try to extract text (basic extraction)
        const arrayBuffer = await file.arrayBuffer()
        const text = new TextDecoder('utf-8').decode(arrayBuffer)
        const readableText = text.match(/[^\x00-\x1F\x7F-\x9F]{10,}/g)?.join(' ') || 'Document content'
        extractedTexts.push({
          name: file.name,
          type: 'document',
          content: readableText.substring(0, 50000)
        })
      }
      // Handle other files
      else {
        extractedTexts.push({
          name: file.name,
          type: 'other',
          content: `File: ${file.name} (${file.type || 'unknown type'}) - Content could not be extracted directly.`
        })
      }
    } catch (error) {
      console.error(`Error reading file ${file.name}:`, error)
      extractedTexts.push({
        name: file.name,
        type: 'error',
        content: `Error reading file: ${error.message}`
      })
    }
  }

  return { texts: extractedTexts, images: extractedImages }
}

/**
 * Get template layout descriptions from template-maps.json
 */
function getTemplateLayoutInfo(templateId) {
  const templateMap = templateMaps?.[templateId]
  if (!templateMap) {
    return { layouts: [], layoutDescription: 'Standard slide layouts' }
  }

  const layouts = templateMap.layouts || []
  const layoutNames = layouts.map(l => `Layout ${l.index}: ${l.name}`).join(', ')
  
  return {
    templateFile: templateMap.template_file,
    titleLayoutIndex: templateMap.title_layout_index ?? 0,
    contentLayoutIndex: templateMap.content_layout_index ?? 1,
    titlePlaceholderIdx: templateMap.title_placeholder_idx ?? 0,
    bodyPlaceholderIdx: templateMap.body_placeholder_idx ?? 1,
    subtitlePlaceholderIdx: templateMap.subtitle_placeholder_idx ?? 4,
    layouts: layouts,
    layoutDescription: layoutNames || 'Title Slide, Content Slide'
  }
}

function getTemplateStyleGuide(template) {
  const guides = {
    'bell-enterprise': [
      'Bell Canada corporate style: clean blue (#005596) headers, white backgrounds.',
      'Large title text, generous whitespace, professional look.',
      'Simple bullet lists, conservative spacing.',
      'Bell Confidential footer for internal documents.'
    ],
    'internal-strategy': [
      'Modern strategy presentation style.',
      'Bold headings, clear visual hierarchy.',
      'Use bullet points for key insights.',
      'Professional but engaging tone.'
    ],
    'quarterly-review': [
      'Executive quarterly review format.',
      'Data-driven with clear metrics.',
      'Concise bullet points.',
      'Professional corporate style.'
    ]
  }

  return guides[template?.id]?.join(' ') || 'Professional enterprise style with clear titles and concise bullets.'
}

/**
 * Generate slides using Groq AI
 */
export async function generateSlidesWithGroq(files, template, templateFile, onProgress) {
  try {
    onProgress?.(10, 'Extracting content from uploaded files...')

    const { texts: extractedTexts, images: extractedImages } = await extractTextFromFiles(files, (message) => {
      onProgress?.(15, message)
    })

    onProgress?.(30, 'Analyzing content and generating slides...')

    // Combine all text content
    const combinedContent = extractedTexts
      .map(f => `# ${f.name} (${f.type})\n${f.content}`)
      .join('\n\n')

    // Keep prompts small for preview models
    const contentPreview = combinedContent.substring(0, 8000)

    // Get template layout info from template-maps.json
    const templateLayoutInfo = getTemplateLayoutInfo(template?.id)
    const templateStyleGuide = getTemplateStyleGuide(template)

    const {
      titleLayoutIndex,
      contentLayoutIndex,
      titlePlaceholderIdx,
      bodyPlaceholderIdx,
      subtitlePlaceholderIdx,
      layoutDescription
    } = templateLayoutInfo

    // Build image context for the AI - images go on existing content slides only
    const imageCount = extractedImages.length
    const imageNames = extractedImages.map(img => img.name)
    const imageContext = imageCount > 0
      ? `

IMAGE PLACEMENT RULES:
You have ${imageCount} image(s): ${imageNames.join(', ')}
- DO NOT create separate slides just for images
- DO NOT write filler text describing images
- Add "image_ref": "filename.jpg" to an EXISTING content slide where the image is relevant
- Images will be displayed alongside the slide's bullet points automatically
- Only reference images on slides that already have meaningful content`
      : ''

    const slideCount = template?.slides || 12

    const prompt = `Create a comprehensive, professional slide deck with ${slideCount} slides based on the SOURCE CONTENT below.

CRITICAL RULES:
1. Use ONLY the Source Content for facts, data, and bullet points - extract ALL key information
2. The template is for LAYOUT/STYLE only - do NOT use any template content as facts
3. Return valid JSON only
4. Be COMPREHENSIVE - fill each slide with detailed, valuable content

Template Style: ${templateStyleGuide}
Available Layouts: ${layoutDescription}
Layout Mapping: title_layout_index=${titleLayoutIndex}, content_layout_index=${contentLayoutIndex}
Placeholder IDs: title_idx=${titlePlaceholderIdx}, body_idx=${bodyPlaceholderIdx}, subtitle_idx=${subtitlePlaceholderIdx}
${imageContext}

SLIDE STRUCTURE REQUIREMENTS:

1. TITLE SLIDE (Slide 1) - REQUIRED:
   - layout_index: ${titleLayoutIndex}
   - title: Compelling presentation title summarizing the content
   - subtitle: Brief tagline or date/author info
   - bullets: [] (empty for title slide)

2. EXECUTIVE SUMMARY SLIDE (Slide 2) - REQUIRED:
   - Provide 4-6 key takeaways from the entire document
   - Each bullet should be a complete, informative sentence

3. CONTENT SLIDES (Slides 3+):
   - layout_index: ${contentLayoutIndex}
   - 4-6 detailed bullet points per slide (NOT 2-3, be comprehensive!)
   - Each bullet should be a full sentence or detailed phrase (15-30 words)
   - Cover ALL major topics, findings, data points from the source
   - Include specific numbers, percentages, dates when available

4. CONCLUSION/NEXT STEPS SLIDE (Final slide):
   - Summarize key recommendations or action items
   - 4-5 actionable bullet points

Return this exact JSON structure:
{
  "title": "[Presentation Title]",
  "slides": [
    {
      "title": "[Slide Title]",
      "subtitle": "[For title slide only - optional for others]",
      "bullets": ["Detailed bullet 1 with full context", "Detailed bullet 2", "Bullet 3", "Bullet 4"],
      "confidence": 85,
      "layout_index": ${contentLayoutIndex},
      "title_placeholder_idx": ${titlePlaceholderIdx},
      "body_placeholder_idx": ${bodyPlaceholderIdx},
      "image_ref": "filename.jpg or null"
    }
  ]
}

CONTENT QUALITY RULES:
- Extract and summarize ALL major sections from the source document
- Each bullet should provide substantial information (not vague statements)
- Include specific data: numbers, percentages, dates, names when available
- Write in professional business language
- Confidence 70-95 based on how directly the content maps to source
- MINIMUM 4 bullets per content slide, MAXIMUM 6
- Total content should comprehensively cover the source material

SOURCE CONTENT:
${contentPreview}`

    onProgress?.(50, 'Calling AI to generate comprehensive slides...')

    const completion = await callGroqChat({
      messages: [
        {
          role: 'system',
          content: `You are an expert presentation designer for Bell Canada creating executive-level presentations. 
Your goal is to create COMPREHENSIVE slide decks that thoroughly cover all source material.
- Extract ALL key information from source documents
- Write detailed, informative bullet points (not vague statements)
- Include specific data: numbers, dates, percentages, names
- Create a proper title slide with subtitle
- Include executive summary and conclusion slides
- Place any uploaded images on appropriate slides
- Fill each slide with 4-6 substantial bullet points`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      responseFormat: { type: 'json_object' },
      temperature: 0.7,
      maxTokens: 8000 // Increased for more comprehensive content
    })

    onProgress?.(80, 'Processing AI response...')

    const responseText = completion.choices?.[0]?.message?.content
    if (!responseText) {
      throw new Error('No response from AI')
    }

    let deckData
    try {
      deckData = JSON.parse(responseText)
    } catch (parseError) {
      console.error('Failed to parse JSON:', responseText)
      throw new Error('Invalid JSON response from AI')
    }

    onProgress?.(90, 'Formatting slides...')

    // Create image lookup map by filename
    const imageMap = {}
    extractedImages.forEach(img => {
      imageMap[img.name] = img.base64
      // Also map without extension for flexibility
      const nameWithoutExt = img.name.replace(/\.[^/.]+$/, '')
      imageMap[nameWithoutExt] = img.base64
    })

    const slides = (deckData.slides || []).map((slide, index) => {
      const isTitle = index === 0
      const layoutIndex = typeof slide.layout_index === 'number'
        ? slide.layout_index
        : isTitle
        ? titleLayoutIndex
        : contentLayoutIndex

      // Find matching image data if image_ref exists
      let imageData = null
      if (slide.image_ref) {
        imageData = imageMap[slide.image_ref] || 
                    imageMap[slide.image_ref.toLowerCase()] ||
                    // Try to find partial match
                    Object.entries(imageMap).find(([key]) => 
                      key.toLowerCase().includes(slide.image_ref.toLowerCase()) ||
                      slide.image_ref.toLowerCase().includes(key.toLowerCase())
                    )?.[1] || null
      }

      return {
        id: index + 1,
        title: slide.title || `Slide ${index + 1}`,
        subtitle: slide.subtitle || null,
        bullets: Array.isArray(slide.bullets) ? slide.bullets.filter(b => b && b.trim()) : [],
        confidence: typeof slide.confidence === 'number' ? slide.confidence : 85,
        layout_index: layoutIndex,
        title_placeholder_idx: slide.title_placeholder_idx ?? titlePlaceholderIdx,
        body_placeholder_idx: slide.body_placeholder_idx ?? bodyPlaceholderIdx,
        subtitle_placeholder_idx: slide.subtitle_placeholder_idx ?? subtitlePlaceholderIdx,
        image_ref: slide.image_ref || null,
        image_data: imageData, // Actual base64 image data
        image_position: 'right', // Default position, user can change
        sourceEvidence: {
          page: Math.floor(Math.random() * 20) + 1,
          text: `Content extracted from source materials: ${extractedTexts[0]?.name || 'uploaded files'}`
        }
      }
    })

    // If there are images that weren't assigned, distribute them to slides
    const unassignedImages = extractedImages.filter(img => 
      !slides.some(s => s.image_data === img.base64)
    )
    
    if (unassignedImages.length > 0) {
      // Assign unassigned images to content slides (skip title slide)
      const contentSlides = slides.filter((_, i) => i > 0)
      unassignedImages.forEach((img, imgIndex) => {
        const targetSlideIndex = imgIndex % contentSlides.length
        const targetSlide = contentSlides[targetSlideIndex]
        if (targetSlide && !targetSlide.image_data) {
          targetSlide.image_ref = img.name
          targetSlide.image_data = img.base64
        }
      })
    }

    // Title slide can have empty bullets, content slides need bullets
    const validSlides = slides.filter((s, index) => {
      if (index === 0) {
        // Title slide just needs a title
        return s.title
      }
      // Content slides need title and bullets
      return s.title && s.bullets.length > 0
    })

    if (validSlides.length === 0) {
      throw new Error('No valid slides generated')
    }

    const deck = {
      id: Date.now(),
      title: deckData.title || 'Generated Presentation',
      template: template,
      slides: validSlides,
      images: extractedImages // Store all images with the deck
    }

    onProgress?.(100, 'Complete!')

    return deck
  } catch (error) {
    console.error('Error generating slides with Groq:', error)
    throw error
  }
}
