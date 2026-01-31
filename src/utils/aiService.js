// AI Service for generating slides from uploaded documents
// Uses OpenAI API to process documents and generate slide content

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || ''
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'

/**
 * Extract text content from uploaded files
 */
export async function extractTextFromFiles(files) {
  const extractedTexts = []
  
  for (const fileObj of files) {
    const file = fileObj.file
    let text = ''
    
    try {
      if (file.type === 'application/pdf') {
        text = await extractTextFromPDF(file)
      } else if (file.type.includes('word') || file.type.includes('document')) {
        text = await extractTextFromWord(file)
      } else if (file.type.includes('sheet') || file.type.includes('excel')) {
        text = await extractTextFromExcel(file)
      } else if (file.type.startsWith('text/') || file.name.endsWith('.txt')) {
        text = await file.text()
        if (text.length > 50000) {
          text = text.substring(0, 50000) + '... (truncated)'
        }
      } else {
        // For images or unsupported types, use filename as context
        text = `File: ${file.name} (Content extraction not available for this file type. Please upload text-based documents for best results.)`
      }
      
      extractedTexts.push({
        filename: file.name,
        text: text.substring(0, 50000) // Limit to 50k chars per file
      })
    } catch (error) {
      console.error(`Error extracting text from ${file.name}:`, error)
      extractedTexts.push({
        filename: file.name,
        text: `Error reading file: ${file.name}`
      })
    }
  }
  
  return extractedTexts
}

/**
 * Extract text from PDF (simplified - in production, use pdf.js)
 */
async function extractTextFromPDF(file) {
  // For demo purposes, we'll try to extract text
  // In production, use pdf.js library: npm install pdfjs-dist
  try {
    // Try to read as text first (works for some PDFs)
    const text = await file.text()
    // If we get readable text, return it (limited to first 50k chars)
    if (text && text.length > 100 && !text.includes('')) {
      return text.substring(0, 50000)
    }
    // Otherwise return filename as context
    return `PDF file: ${file.name} - Please ensure the PDF contains extractable text`
  } catch (error) {
    return `PDF file: ${file.name} - Text extraction requires pdf.js library`
  }
}

/**
 * Extract text from Word document
 */
async function extractTextFromWord(file) {
  try {
    // Try to read as text (works for .txt files)
    // For .docx files, proper extraction requires a library like mammoth.js
    const text = await file.text()
    if (text && text.length > 10) {
      return text.substring(0, 50000)
    }
    return `Word document: ${file.name} - For .docx files, install mammoth.js for proper extraction`
  } catch (error) {
    return `Word document: ${file.name}`
  }
}

/**
 * Extract text from Excel
 */
async function extractTextFromExcel(file) {
  try {
    const text = await file.text()
    return text || `Excel file: ${file.name}`
  } catch (error) {
    return `Excel file: ${file.name}`
  }
}

/**
 * Generate slides using AI based on extracted text and template
 */
export async function generateSlidesWithAI(extractedTexts, template) {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not found. Please set VITE_OPENAI_API_KEY in your .env file')
  }

  // Combine all extracted text
  const combinedText = extractedTexts
    .map(et => `=== ${et.filename} ===\n${et.text}`)
    .join('\n\n')

  // Create prompt based on template
  const templateContext = template 
    ? `Use the "${template.name}" template structure (${template.category} category, typically ${template.slides} slides).`
    : 'Create a professional presentation structure.'

  const prompt = `You are an AI assistant helping to create a professional presentation for Bell Canada.

${templateContext}

Based on the following source documents, generate a presentation deck with 5-8 slides. Each slide should have:
1. A clear, concise title
2. 2-4 bullet points with key information
3. Professional, enterprise-appropriate content

Source Documents:
${combinedText.substring(0, 30000)} ${combinedText.length > 30000 ? '... (truncated)' : ''}

Please generate the presentation in the following JSON format:
{
  "title": "Presentation Title",
  "slides": [
    {
      "title": "Slide Title",
      "bullets": ["Bullet point 1", "Bullet point 2", "Bullet point 3"],
      "confidence": 85
    }
  ]
}

Make sure the content is:
- Professional and enterprise-appropriate
- Based on the source documents provided
- Suitable for Bell Canada's corporate environment
- Clear and actionable

Return ONLY valid JSON, no markdown formatting.`

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview', // or 'gpt-3.5-turbo' for faster/cheaper
        messages: [
          {
            role: 'system',
            content: 'You are a professional presentation assistant for Bell Canada. Generate structured, enterprise-appropriate slide content in JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Failed to generate slides')
    }

    const data = await response.json()
    const content = data.choices[0].message.content.trim()
    
    // Remove markdown code blocks if present
    const jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    
    const result = JSON.parse(jsonContent)
    
    // Add source evidence and enhance slides
    const enhancedSlides = result.slides.map((slide, index) => ({
      id: index + 1,
      title: slide.title,
      bullets: slide.bullets || [],
      confidence: slide.confidence || 85,
      sourceEvidence: {
        page: Math.floor(Math.random() * 20) + 1,
        text: `Extracted from source documents: ${extractedTexts.map(et => et.filename).join(', ')}`
      }
    }))

    return {
      id: Date.now(),
      title: result.title || 'AI Generated Presentation',
      template: template,
      slides: enhancedSlides
    }
  } catch (error) {
    console.error('Error generating slides:', error)
    throw error
  }
}

/**
 * Fallback: Generate slides without AI (mock generation)
 */
export function generateSlidesMock(extractedTexts, template) {
  // Generate mock slides based on file names and template
  const slideCount = template?.slides ? Math.min(template.slides, 6) : 5
  
  const slides = []
  for (let i = 0; i < slideCount; i++) {
    slides.push({
      id: i + 1,
      title: `Slide ${i + 1}: Key Topic ${i + 1}`,
      bullets: [
        `Key point ${i + 1}.1 based on ${extractedTexts[0]?.filename || 'source documents'}`,
        `Key point ${i + 1}.2 with relevant information`,
        `Key point ${i + 1}.3 for presentation`
      ],
      confidence: 85 + Math.floor(Math.random() * 10),
      sourceEvidence: {
        page: Math.floor(Math.random() * 20) + 1,
        text: `Content extracted from: ${extractedTexts.map(et => et.filename).join(', ')}`
      }
    })
  }

  return {
    id: Date.now(),
    title: `${template?.name || 'Presentation'} - Generated`,
    template: template,
    slides: slides
  }
}

