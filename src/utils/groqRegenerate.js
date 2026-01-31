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
  temperature = 0.7,
  maxTokens = 200
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
      max_tokens: maxTokens
    })
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Groq API error: ${response.status} ${response.statusText} - ${errorBody}`)
  }

  return response.json()
}

export async function regenerateBulletPoint(context, currentBullet) {
  try {
    const prompt = `You are helping to refine a bullet point for a Bell Canada presentation.

Context: ${context}

Current bullet point: ${currentBullet}

Please provide an improved version of this bullet point that is:
- More concise and professional
- Action-oriented
- Suitable for a Bell Canada enterprise presentation
- Based on the context provided

Return only the improved bullet point text, nothing else.`

    const completion = await callGroqChat({
      messages: [
        {
          role: 'system',
          content: 'You are a professional presentation writer for Bell Canada. Improve bullet points to be concise and professional.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      temperature: 0.7,
      maxTokens: 200
    })

    const improvedBullet = completion.choices?.[0]?.message?.content?.trim()
    return improvedBullet || currentBullet
  } catch (error) {
    console.error('Error regenerating bullet:', error)
    return currentBullet
  }
}

export async function regenerateSlideTitle(context, currentTitle) {
  try {
    const prompt = `You are helping to refine a slide title for a Bell Canada presentation.

Context: ${context}

Current title: ${currentTitle}

Please provide an improved version of this title that is:
- Clear and professional
- Concise (under 10 words)
- Suitable for a Bell Canada enterprise presentation
- Based on the context provided

Return only the improved title text, nothing else.`

    const completion = await callGroqChat({
      messages: [
        {
          role: 'system',
          content: 'You are a professional presentation writer for Bell Canada. Create clear, professional slide titles.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      temperature: 0.7,
      maxTokens: 100
    })

    const improvedTitle = completion.choices?.[0]?.message?.content?.trim()
    return improvedTitle || currentTitle
  } catch (error) {
    console.error('Error regenerating title:', error)
    return currentTitle
  }
}

export async function generateNewBulletPoint(context, existingBullets) {
  try {
    const existingText = existingBullets.join('\n')

    const prompt = `You are helping to create a new bullet point for a Bell Canada presentation slide.

Context: ${context}

Existing bullet points on this slide:
${existingText}

Please create a new, relevant bullet point that:
- Complements the existing bullet points
- Is concise and professional
- Is action-oriented
- Is suitable for a Bell Canada enterprise presentation
- Adds value to the slide without being redundant

Return only the new bullet point text, nothing else.`

    const completion = await callGroqChat({
      messages: [
        {
          role: 'system',
          content: 'You are a professional presentation writer for Bell Canada. Create relevant, professional bullet points.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      temperature: 0.7,
      maxTokens: 200
    })

    const newBullet = completion.choices?.[0]?.message?.content?.trim()
    return newBullet || 'New bullet point'
  } catch (error) {
    console.error('Error generating new bullet:', error)
    return 'New bullet point'
  }
}
