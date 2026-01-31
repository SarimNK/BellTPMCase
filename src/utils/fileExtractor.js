// Extract text from various file types
export async function extractTextFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    // Handle text-based files
    if (file.type === 'text/plain' || file.type.includes('text')) {
      reader.onload = (e) => resolve(e.target.result)
      reader.onerror = reject
      reader.readAsText(file)
    } 
    // Handle PDF files - basic extraction
    else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      // For PDFs, we'll use a simple approach
      // In production, you'd use pdf.js or a backend service
      reader.onload = async (e) => {
        try {
          // Try to extract text using a simple method
          // Note: This is a simplified approach. For production, use pdf.js
          const arrayBuffer = e.target.result
          const uint8Array = new Uint8Array(arrayBuffer)
          
          // Convert to string and try to extract readable text
          let text = ''
          for (let i = 0; i < Math.min(uint8Array.length, 100000); i++) {
            const char = String.fromCharCode(uint8Array[i])
            if (/[\x20-\x7E\n\r]/.test(char)) {
              text += char
            }
          }
          
          // Clean up the text
          text = text.replace(/[^\x20-\x7E\n\r]/g, ' ')
          text = text.replace(/\s+/g, ' ')
          
          if (text.trim().length > 100) {
            resolve(`PDF Content from ${file.name}:\n\n${text.substring(0, 50000)}`)
          } else {
            resolve(`PDF file: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`)
          }
        } catch (err) {
          resolve(`PDF file: ${file.name} (${(file.size / 1024).toFixed(1)} KB) - Unable to extract text`)
        }
      }
      reader.onerror = reject
      reader.readAsArrayBuffer(file)
    }
    // Handle Word documents
    else if (
      file.type.includes('word') || 
      file.type.includes('document') || 
      file.name.endsWith('.doc') || 
      file.name.endsWith('.docx')
    ) {
      // For Word docs, try reading as text (works for some formats)
      reader.onload = (e) => {
        const text = e.target.result
        if (text && text.length > 50) {
          resolve(text)
        } else {
          resolve(`Word document: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`)
        }
      }
      reader.onerror = () => {
        resolve(`Word document: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`)
      }
      reader.readAsText(file)
    }
    // Handle Excel files
    else if (
      file.type.includes('sheet') || 
      file.type.includes('excel') || 
      file.name.endsWith('.xls') || 
      file.name.endsWith('.xlsx')
    ) {
      resolve(`Excel spreadsheet: ${file.name} (${(file.size / 1024).toFixed(1)} KB)\n\nNote: Excel files require special parsing. Please provide a summary or export as CSV.`)
    }
    // Handle images
    else if (file.type.includes('image')) {
      reader.onload = (e) => {
        const base64 = e.target.result.split(',')[1]
        resolve({ 
          type: 'image', 
          base64, 
          filename: file.name,
          mimeType: file.type
        })
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    }
    // Fallback: try reading as text
    else {
      reader.onload = (e) => {
        const text = e.target.result
        if (text && text.length > 50) {
          resolve(text)
        } else {
          resolve(`File: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`)
        }
      }
      reader.onerror = () => {
        resolve(`File: ${file.name} (${(file.size / 1024).toFixed(1)} KB) - Unable to read`)
      }
      reader.readAsText(file)
    }
  })
}

// Process multiple files and extract their content
export async function processFiles(files, onProgress) {
  const results = []
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i].file || files[i]
    onProgress?.(i, files.length, `Processing ${file.name}...`)
    
    try {
      const content = await extractTextFromFile(file)
      results.push({
        name: file.name,
        type: file.type,
        size: file.size,
        content: content
      })
    } catch (error) {
      console.error(`Error processing ${file.name}:`, error)
      results.push({
        name: file.name,
        type: file.type,
        size: file.size,
        content: `Error reading file: ${error.message}`
      })
    }
  }
  
  return results
}

