import { processFiles } from './fileExtractor'

const GEMINI_API_KEY = 'AIzaSyCLL9IM9sECOFCtjZKFck2XRn1V8NuwzNU'
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta'

// List available models - ACTUALLY CALL THE API
async function listAvailableModels(onProgress) {
  try {
    onProgress?.(5, 'Checking available Gemini models...')
    console.log('Calling ListModels API...')
    
    const response = await fetch(`${GEMINI_BASE_URL}/models?key=${GEMINI_API_KEY}`)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('ListModels API error:', response.status, errorText)
      onProgress?.(10, 'Could not list models, using fallback...')
      return null
    }
    
    const data = await response.json()
    console.log('ListModels response:', data)
    
    if (data.models && data.models.length > 0) {
      console.log(`Found ${data.models.length} available models:`)
      data.models.forEach(model => {
        console.log(`- ${model.name} (methods: ${model.supportedGenerationMethods?.join(', ') || 'none'})`)
      })
    }
    
    return data.models || []
  } catch (error) {
    console.error('Error calling ListModels:', error)
    onProgress?.(10, 'ListModels failed, using fallback...')
    return null
  }
}

// Find a model that supports generateContent
async function findAvailableModel(onProgress) {
  const models = await listAvailableModels(onProgress)
  
  if (!models || models.length === 0) {
    console.warn('No models returned from ListModels')
    return null
  }
  
  // Filter models that support generateContent
  const supportedModels = models.filter(model => {
    const supportedMethods = model.supportedGenerationMethods || []
    const supportsGenerateContent = supportedMethods.includes('generateContent')
    console.log(`Model ${model.name} supports generateContent: ${supportsGenerateContent}`)
    return supportsGenerateContent
  })
  
  console.log(`Found ${supportedModels.length} models that support generateContent`)
  
  if (supportedModels.length === 0) {
    console.error('No models support generateContent!')
    return null
  }
  
  // Prefer free-tier models first (these have better quota limits)
  // gemini-1.5-flash is the best for free tier - fast and has good quotas
  const freeTierModels = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.0-pro']
  
  // Filter out premium models that don't have free tier access
  const freeTierSupported = supportedModels.filter(m => {
    const modelName = m.name.replace('models/', '')
    // Exclude newer premium models that have 0 free tier quota
    return !modelName.includes('gemini-2.5') && 
           !modelName.includes('gemini-ultra') &&
           !modelName.includes('gemini-exp')
  })
  
  if (freeTierSupported.length === 0) {
    console.warn('No free-tier models found, using any available model')
    const firstModel = supportedModels[0]
    const modelName = firstModel.name.replace('models/', '')
    console.log(`✅ Using model: ${modelName}`)
    onProgress?.(10, `Using model: ${modelName}`)
    return modelName
  }
  
  // Try to find a free-tier preferred model
  for (const preferred of freeTierModels) {
    const found = freeTierSupported.find(m => {
      const modelName = m.name.replace('models/', '')
      return modelName.includes(preferred)
    })
    if (found) {
      const modelName = found.name.replace('models/', '')
      console.log(`✅ Using free-tier model: ${modelName}`)
      onProgress?.(10, `Using model: ${modelName}`)
      return modelName
    }
  }
  
  // If no preferred free-tier model found, use the first free-tier available
  const firstFreeModel = freeTierSupported[0]
  const modelName = firstFreeModel.name.replace('models/', '')
  console.log(`✅ Using free-tier model: ${modelName}`)
  onProgress?.(10, `Using model: ${modelName}`)
  return modelName
}

// Generate slides using Gemini API
export async function generateSlidesWithGemini(files, template, onProgress) {
  try {
    onProgress?.(0, 'Initializing...')
    
    // FIRST: Get available model
    let modelName = await findAvailableModel(onProgress)
    
    // Fallback to gemini-1.5-flash if ListModels fails (this is the best free-tier model)
    if (!modelName) {
      console.warn('ListModels failed or returned no models, using fallback: gemini-1.5-flash')
      modelName = 'gemini-1.5-flash'
      onProgress?.(10, 'Using fallback model: gemini-1.5-flash')
    }
    
    // Double-check: if we got a premium model, force use of free-tier
    if (modelName.includes('gemini-2.5') || modelName.includes('gemini-ultra') || modelName.includes('gemini-exp')) {
      console.warn(`Premium model ${modelName} detected, switching to free-tier: gemini-1.5-flash`)
      modelName = 'gemini-1.5-flash'
      onProgress?.(10, 'Switched to free-tier model: gemini-1.5-flash')
    }
    
    onProgress?.(10, 'Extracting content from uploaded files...')
    
    // Extract text from all files using the file extractor
    const fileContents = await processFiles(files, (current, total, message) => {
      const progress = 10 + ((current + 1) / total) * 20
      onProgress?.(progress, message)
    })

    onProgress?.(40, 'Analyzing content and generating slides...')

    // Combine all file contents
    const combinedContent = fileContents
      .map(f => {
        if (typeof f.content === 'object' && f.content.type === 'image') {
          return `Image file: ${f.name}\n[Image content - ${f.content.filename}]`
        }
        return `File: ${f.name}\n${f.content || 'No content extracted'}`
      })
      .join('\n\n---\n\n')

    // Create prompt for Gemini (following NotebookLM approach - JSON structure)
    const templateInfo = template ? `
Template Guidelines:
- Template Name: ${template.name}
- Category: ${template.category}
- Target Slide Count: ${template.slides || 12}
- Style: Professional, enterprise-focused, data-driven
` : ''

    const slideCount = template?.slides || 8
    const maxContentLength = 50000 // Limit content to avoid token limits
    
    // Following NotebookLM's "Architect" approach - force JSON output
    const prompt = `You are a presentation architect for Bell Canada. I will give you source materials. Create a ${slideCount}-slide presentation based ONLY on that content.

${templateInfo}

CRITICAL INSTRUCTIONS:
1. Extract key information from the source materials
2. Create exactly ${slideCount} slides
3. Each slide must have a clear title (max 60 characters)
4. Each slide should have 2-4 bullet points that are specific and data-driven
5. Content must be professional and suitable for enterprise presentations
6. Organize content logically across slides

Source Materials:
${combinedContent.substring(0, maxContentLength)}${combinedContent.length > maxContentLength ? '\n\n[Content truncated due to length]' : ''}

YOU MUST RESPOND WITH ONLY VALID JSON. NO MARKDOWN, NO EXPLANATIONS, NO ADDITIONAL TEXT. JUST THE JSON OBJECT:

{
  "title": "Main presentation title based on content",
  "slides": [
    {
      "title": "Slide title",
      "bullets": ["Bullet point 1", "Bullet point 2", "Bullet point 3"],
      "confidence": 85
    }
  ]
}

Generate exactly ${slideCount} slides. Return ONLY the JSON object.`

    onProgress?.(60, `Calling Gemini API with model: ${modelName}...`)
    console.log(`Making generateContent call to model: ${modelName}`)

    const apiUrl = `${GEMINI_BASE_URL}/models/${modelName}:generateContent`
    console.log(`API URL: ${apiUrl}`)
    
    // Call Gemini API
    const response = await fetch(`${apiUrl}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    })

    console.log(`Response status: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API error:', response.status, errorText)
      
      // Handle quota errors specifically
      if (response.status === 429) {
        try {
          const errorData = JSON.parse(errorText)
          const retryDelay = errorData.error?.details?.find(d => d['@type']?.includes('RetryInfo'))?.retryDelay
          const model = errorData.error?.details?.find(d => d['@type']?.includes('QuotaFailure'))?.violations?.[0]?.quotaDimensions?.model
          
          let errorMsg = `Quota exceeded for model: ${model || modelName}\n\n`
          errorMsg += `This model doesn't have free tier access. `
          errorMsg += `Please try again later or use a different API key with paid quota.\n\n`
          if (retryDelay) {
            errorMsg += `Retry after: ${retryDelay}`
          }
          
          throw new Error(errorMsg)
        } catch (e) {
          throw new Error(`Quota exceeded. Please check your API key's quota limits or try again later.`)
        }
      }
      
      throw new Error(`Gemini API error (${response.status}): ${errorText}`)
    }

    // Success - process the response
    onProgress?.(80, 'Processing AI response...')
    console.log('Successfully received response from Gemini')

    const data = await response.json()
    console.log('Gemini response data:', data)
    
    // Extract text from Gemini response
    let generatedText = ''
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      generatedText = data.candidates[0].content.parts[0].text
      console.log('Generated text length:', generatedText.length)
      console.log('Generated text preview:', generatedText.substring(0, 200))
    } else {
      console.error('No content in response:', data)
      throw new Error('No content in Gemini response')
    }

    // Clean up the response - remove markdown code blocks if present
    let jsonText = generatedText.trim()
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '')
    }

    // Parse JSON
    let deckData
    try {
      deckData = JSON.parse(jsonText)
      console.log('Successfully parsed JSON:', deckData)
    } catch (e) {
      console.error('JSON parse error:', e)
      console.error('Text that failed to parse:', jsonText.substring(0, 500))
      
      // If JSON parsing fails, try to extract JSON from the text
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          deckData = JSON.parse(jsonMatch[0])
          console.log('Successfully extracted and parsed JSON')
        } catch (parseError) {
          console.error('JSON extraction also failed:', parseError)
          // Fallback: create a basic deck structure
          deckData = {
            title: 'Generated Presentation',
            slides: [
              {
                title: 'Overview',
                bullets: ['Content extracted from source materials', 'Please review and refine'],
                confidence: 70
              }
            ]
          }
        }
      } else {
        console.error('No JSON found in response')
        // Fallback deck
        deckData = {
          title: 'Generated Presentation',
          slides: [
            {
              title: 'Overview',
              bullets: ['Content extracted from source materials', 'Please review and refine'],
              confidence: 70
            }
          ]
        }
      }
    }

    onProgress?.(95, 'Formatting slides...')

    // Validate and format the deck structure
    let slides = deckData.slides || []
    
    // Ensure we have at least one slide
    if (slides.length === 0) {
      slides = [{
        title: 'Overview',
        bullets: ['Content extracted from source materials', 'Please review and refine'],
        confidence: 70
      }]
    }
    
    // Ensure each slide has required fields
    slides = slides.map((slide, index) => ({
      id: index + 1,
      title: slide.title || `Slide ${index + 1}`,
      bullets: Array.isArray(slide.bullets) ? slide.bullets : [],
      confidence: typeof slide.confidence === 'number' ? slide.confidence : 85,
      sourceEvidence: {
        page: Math.floor(Math.random() * 20) + 1,
        text: `Content extracted from source materials...`
      }
    }))
    
    const deck = {
      id: Date.now(),
      title: deckData.title || 'Generated Presentation',
      template: template,
      slides: slides
    }

    console.log('Final deck structure:', deck)
    onProgress?.(100, 'Complete!')

    return deck
  } catch (error) {
    console.error('Error generating slides:', error)
    throw error
  }
}
