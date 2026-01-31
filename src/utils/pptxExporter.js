import PptxGenJS from 'pptxgenjs'
import templateMaps from '../resources/template-maps.json'

export async function exportToPPTX(deck, internalUseOnly = true, templateId = 'bell-enterprise') {
  if (!deck || !deck.slides || deck.slides.length === 0) {
    alert('No deck to export')
    return
  }

  const templateMap = templateMaps?.[templateId]
  if (templateMap) {
    try {
      const response = await fetch('http://localhost:8000/api/pptx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId,
          internalUseOnly,
          deck
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText)
      }

      const blob = await response.blob()
      const filename = `${deck.title || 'Bell_Presentation'}_${new Date().toISOString().split('T')[0]}.pptx`
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()
      return
    } catch (error) {
      console.error('Template export failed, falling back to basic export:', error)
      alert('Template export failed. Falling back to basic export. Ensure the template server is running.')
    }
  }

  const pres = new PptxGenJS()
  
  // Set presentation properties
  pres.author = 'Bell AI Slide Generator'
  pres.company = 'Bell Canada'
  pres.title = deck.title || 'Bell Presentation'
  pres.layout = 'LAYOUT_WIDE'

  // Define Bell color scheme
  const bellBlue = '005596'
  const bellLightBlue = '009CDC'
  const bellGray = 'F3F4F6'

  // Add each slide
  deck.slides.forEach((slide, index) => {
    const slideObj = pres.addSlide()
    const isTitle = index === 0

    // Set slide background
    slideObj.background = { color: 'FFFFFF' }

    if (isTitle) {
      // Title slide layout - centered
      slideObj.addText(slide.title || deck.title || 'Presentation', {
        x: 0.5,
        y: 2.5,
        w: 9,
        h: 1.2,
        fontSize: 44,
        fontFace: 'Inter',
        bold: true,
        color: bellBlue,
        align: 'center'
      })

      // Subtitle
      if (slide.subtitle) {
        slideObj.addText(slide.subtitle, {
          x: 0.5,
          y: 3.8,
          w: 9,
          h: 0.6,
          fontSize: 20,
          fontFace: 'Inter',
          color: '666666',
          align: 'center'
        })
      }
    } else {
      // Content slide layout
      const hasImage = slide.image_data
      const imageOnLeft = slide.image_position === 'left'
      const textWidth = hasImage ? 4.5 : 9
      const textX = hasImage && imageOnLeft ? 5.0 : 0.5
      const bulletX = hasImage && imageOnLeft ? 5.3 : 0.8

      // Add title
      slideObj.addText(slide.title || `Slide ${index + 1}`, {
        x: textX,
        y: 0.5,
        w: textWidth,
        h: 0.8,
        fontSize: 32,
        fontFace: 'Inter',
        bold: true,
        color: bellBlue,
        align: 'left'
      })

      // Add bullet points
      let yPos = 1.6
      slide.bullets.forEach((bullet, bulletIndex) => {
        if (bullet && bullet.trim()) {
          slideObj.addText(bullet, {
            x: bulletX,
            y: yPos,
            w: textWidth - 0.5,
            h: 0.8,
            fontSize: 16,
            fontFace: 'Inter',
            color: '333333',
            align: 'left',
            bullet: { code: '●' },
            lineSpacing: 24,
            valign: 'top'
          })
          yPos += 0.85
        }
      })

      // Add image if present
      if (hasImage) {
        try {
          const imageOnLeft = slide.image_position === 'left'
          slideObj.addImage({
            data: slide.image_data,
            x: imageOnLeft ? 0.5 : 5.2,
            y: 1.2,
            w: 4.3,
            h: 3.5,
            sizing: { type: 'contain' }
          })
        } catch (imgError) {
          console.error('Failed to add image to slide:', imgError)
        }
      }
    }

    // Add Bell Confidential watermark if internal use only
    if (internalUseOnly) {
      slideObj.addText('Bell Confidential', {
        x: 0.5,
        y: 6.8,
        w: 2,
        h: 0.3,
        fontSize: 9,
        fontFace: 'Inter',
        color: '999999',
        align: 'left',
        italic: true
      })
    }

    // Add slide number
    slideObj.addText(`${index + 1}`, {
      x: 9,
      y: 6.8,
      w: 0.5,
      h: 0.3,
      fontSize: 10,
      fontFace: 'Inter',
      color: '999999',
      align: 'right'
    })
  })

  // Generate and download
  const filename = `${deck.title || 'Bell_Presentation'}_${new Date().toISOString().split('T')[0]}.pptx`
  pres.writeFile({ fileName: filename })
}

