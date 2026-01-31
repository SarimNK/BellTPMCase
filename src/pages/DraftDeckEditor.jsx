import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { getTemplateTheme } from '../utils/templateThemes'

export default function DraftDeckEditor() {
  const navigate = useNavigate()
  const { deck, setCurrentSlideIndex, setDeck, updateSlide, selectedTemplate } = useStore()
  const [selectedSlideIndex, setSelectedSlideIndex] = useState(0)
  const [draggedIndex, setDraggedIndex] = useState(null)
  const theme = getTemplateTheme(selectedTemplate)

  if (!deck) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>No deck available. Please generate a deck first.</p>
      </div>
    )
  }

  const currentSlide = deck.slides[selectedSlideIndex] || deck.slides[0]

  const handleSlideClick = (index) => {
    setSelectedSlideIndex(index)
    setCurrentSlideIndex(index)
  }
  const handleDragStart = (index) => {
    setDraggedIndex(index)
  }

  const handleDrop = (targetIndex) => {
    if (draggedIndex === null || draggedIndex === targetIndex) return
    const reordered = [...deck.slides]
    const [moved] = reordered.splice(draggedIndex, 1)
    reordered.splice(targetIndex, 0, moved)
    setDeck({ ...deck, slides: reordered })
    setSelectedSlideIndex(targetIndex)
    setCurrentSlideIndex(targetIndex)
    setDraggedIndex(null)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleEditSlide = (index) => {
    setCurrentSlideIndex(index)
    navigate(`/slide/${index}`)
  }

  const handleTitleChange = (newTitle) => {
    updateSlide(selectedSlideIndex, { title: newTitle })
  }

  const handleBulletChange = (bulletIndex, newText) => {
    const newBullets = [...currentSlide.bullets]
    newBullets[bulletIndex] = newText
    updateSlide(selectedSlideIndex, { bullets: newBullets })
  }

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return 'green'
    if (confidence >= 70) return 'yellow'
    return 'red'
  }

  const getConfidenceLabel = (confidence) => {
    if (confidence >= 90) return 'High'
    if (confidence >= 70) return 'Med'
    return 'Low'
  }

  return (
    <div className="bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100 flex flex-col h-full transition-colors duration-200">
      <header className="shrink-0 bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark px-4 py-3 flex items-center justify-between shadow-sm z-20">
        <div className="flex items-center space-x-3">
          <button className="p-1 -ml-1 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full" onClick={() => navigate('/upload')}>
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h1 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">Draft Deck Editor</h1>
            <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400">Step 5/5: Final Review</p>
          </div>
        </div>
        <button
          className="flex items-center space-x-1 px-3 py-1.5 bg-white dark:bg-surface-dark border border-primary text-primary dark:text-blue-400 rounded-lg shadow-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
          onClick={() => navigate('/export')}
        >
          <span className="material-symbols-outlined text-sm">ios_share</span>
          <span className="text-xs font-bold">Export</span>
        </button>
      </header>

      <div className={`flex flex-1 overflow-hidden relative ${theme.chromeBg}`}>
        <aside className={`w-[80px] ${theme.sidebarBg} border-r border-border-light dark:border-border-dark flex flex-col items-center py-4 space-y-5 overflow-y-auto shrink-0 z-10 no-scrollbar`}>
          {deck.slides.map((slide, index) => (
            <div
              key={slide.id}
              className="group relative w-14 aspect-[16/10] cursor-pointer"
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(index)}
              onClick={() => handleSlideClick(index)}
            >
              {selectedSlideIndex === index && (
                <div className="absolute -left-[16px] top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full" style={{ backgroundColor: theme.accentColor }}></div>
              )}
              <div
                className={`w-full h-full rounded overflow-hidden flex flex-col transition-all duration-200 ${theme.sidebarItem} ${
                  selectedSlideIndex === index ? theme.sidebarActive : ''
                }`}
              >
                {/* Mini template header accent */}
                <div className={`h-0.5 ${theme.headerAccent}`}></div>
                {/* Slide content preview */}
                <div className={`flex-1 ${theme.slideBackground} p-1 flex gap-0.5 relative`}>
                  {/* Text placeholders on left */}
                  <div className="flex-1 flex flex-col gap-0.5">
                    <div className={`h-1 w-3/4 rounded-full`} style={{ backgroundColor: `${theme.accentColor}40` }}></div>
                    <div className={`h-0.5 w-full bg-gray-300/50 rounded-full mt-0.5`}></div>
                    <div className={`h-0.5 w-5/6 bg-gray-300/50 rounded-full`}></div>
                  </div>
                  {/* Mini image preview on right if present */}
                  {slide.image_data && (
                    <div className="w-1/3 flex items-center justify-center">
                      <img 
                        src={slide.image_data} 
                        alt="" 
                        className="max-w-full max-h-full object-contain rounded-sm"
                      />
                    </div>
                  )}
                </div>
              </div>
              <span className={`absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-medium`} style={{ color: selectedSlideIndex === index ? theme.accentColor : '#9CA3AF' }}>
                {index + 1}
              </span>
              <div
                className={`absolute -top-1.5 -right-1.5 flex items-center justify-center text-[7px] font-bold px-1 py-0.5 rounded-full border shadow-sm z-10 ${
                  getConfidenceColor(slide.confidence) === 'green'
                    ? 'bg-green-100 text-green-700 border-green-200'
                    : getConfidenceColor(slide.confidence) === 'yellow'
                    ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                    : 'bg-red-100 text-red-700 border-red-200'
                }`}
                title={`${slide.confidence}% Confidence`}
              >
                {getConfidenceLabel(slide.confidence)}
              </div>
            </div>
          ))}
          <button
            className="w-8 h-8 rounded-full border border-dashed border-gray-400 text-gray-400 hover:text-primary hover:border-primary flex items-center justify-center mt-4 transition"
            onClick={() => {
              // Add new slide
              const newSlide = {
                id: Date.now(),
                title: 'New Slide',
                bullets: [],
                confidence: 0
              }
              const newDeck = { ...deck, slides: [...deck.slides, newSlide] }
              setDeck(newDeck)
            }}
          >
            <span className="material-symbols-outlined text-lg">add</span>
          </button>
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 md:p-6 no-scrollbar">
            <div className="desktop-frame w-full">
              {/* Slide Preview - styled to match selected template */}
              <div className={`aspect-[16/10] ${theme.panelBg} ${theme.panelBorder} ${theme.panelShadow} rounded-xl overflow-hidden flex flex-col relative transition-all duration-300`}>
                {/* Template header accent bar */}
                <div className={`h-1.5 ${theme.headerAccent}`}></div>
                
                {/* Slide content area with template background */}
                <div className={`flex-1 ${theme.slideBackground} p-6 md:p-8 flex flex-col`}>
                  {/* Title section */}
                  <div className="mb-4 md:mb-6 group">
                    <label className="sr-only">Slide Title</label>
                    <input
                      className={`w-full ${theme.titleSize} ${theme.titleText} bg-transparent border-none p-0 focus:ring-0 placeholder-gray-300 rounded transition px-1 -ml-1`}
                      type="text"
                      value={currentSlide.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="Enter slide title..."
                    />
                    {/* Subtitle for title slide (first slide) */}
                    {selectedSlideIndex === 0 && (
                      <input
                        className={`w-full text-lg ${theme.bodyText} bg-transparent border-none p-0 focus:ring-0 placeholder-gray-300 rounded transition px-1 mt-2 opacity-80`}
                        type="text"
                        value={currentSlide.subtitle || ''}
                        onChange={(e) => updateSlide(selectedSlideIndex, { subtitle: e.target.value })}
                        placeholder="Enter subtitle or tagline..."
                      />
                    )}
                    <div className={`h-0.5 w-24 ${theme.headerAccent} mt-3 rounded-full opacity-60`}></div>
                  </div>
                  
                  {/* Content area - two column layout when image present */}
                  <div className={`flex-1 flex ${currentSlide.image_data ? 'gap-6' : ''} ${currentSlide.image_data && currentSlide.image_position === 'left' ? 'flex-row-reverse' : ''}`}>
                    {/* Bullets section */}
                    <div className={`space-y-3 ${currentSlide.image_data ? 'flex-1' : 'w-full'} overflow-y-auto`}>
                      {currentSlide.bullets.map((bullet, index) => (
                        <div key={index} className="flex gap-3 group items-start">
                          <span className={`mt-2 w-2 h-2 rounded-full ${theme.bulletDot} shrink-0`}></span>
                          <textarea
                            className={`w-full text-sm md:text-base ${theme.bodyText} leading-relaxed bg-transparent border-none p-0 focus:ring-0 resize-none rounded transition`}
                            rows="2"
                            value={bullet}
                            onChange={(e) => handleBulletChange(index, e.target.value)}
                            placeholder="Enter bullet point..."
                          />
                        </div>
                      ))}
                    </div>
                    
                    {/* Image section - shown alongside bullets */}
                    {currentSlide.image_data && (
                      <div className="w-2/5 flex flex-col shrink-0">
                        {/* Image position toggle */}
                        <div className="flex gap-1 mb-2">
                          <button
                            className={`p-1.5 rounded text-xs transition ${currentSlide.image_position === 'left' ? 'bg-primary text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-600'}`}
                            onClick={() => updateSlide(selectedSlideIndex, { image_position: 'left' })}
                            title="Image on left"
                          >
                            <span className="material-symbols-outlined text-base">west</span>
                          </button>
                          <button
                            className={`p-1.5 rounded text-xs transition ${!currentSlide.image_position || currentSlide.image_position === 'right' ? 'bg-primary text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-600'}`}
                            onClick={() => updateSlide(selectedSlideIndex, { image_position: 'right' })}
                            title="Image on right"
                          >
                            <span className="material-symbols-outlined text-base">east</span>
                          </button>
                          <button
                            className="p-1.5 rounded text-xs bg-red-100 hover:bg-red-200 text-red-600 ml-auto transition"
                            onClick={() => updateSlide(selectedSlideIndex, { image_data: null, image_ref: null })}
                            title="Remove image"
                          >
                            <span className="material-symbols-outlined text-base">close</span>
                          </button>
                        </div>
                        <div className="flex-1 flex items-center justify-center">
                          <img 
                            src={currentSlide.image_data} 
                            alt="Slide visual"
                            className="max-w-full max-h-[180px] object-contain rounded-lg shadow-md"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Footer */}
                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-200/50">
                    <div className="flex items-center gap-2">
                      <div className={`h-4 w-4 rounded ${theme.headerAccent}`}></div>
                      <span className={theme.footerText}>{theme.templateName || 'Bell Canada'}</span>
                    </div>
                    <span className={theme.footerText}>Bell Confidential</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={`shrink-0 ${theme.aiPanelBg} border-t border-gray-200 dark:border-gray-700 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20`}>
            <div className="max-w-md mx-auto w-full">
              <div className={`flex items-center justify-between px-4 py-2 border-b border-gray-100 dark:border-gray-700 ${theme.aiPanelHeaderBg}`}>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-sm">auto_awesome</span>
                  <span className="text-xs font-bold text-primary uppercase tracking-wide">AI Editor</span>
                </div>
                <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400">
                  <span className="material-symbols-outlined text-lg">close_fullscreen</span>
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  <button
                    className="flex-1 flex flex-col items-center justify-center gap-1 px-3 py-3 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-600 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 shadow-sm active:scale-95 transition hover:border-primary/50"
                    onClick={() => handleEditSlide(selectedSlideIndex)}
                  >
                    <span className="material-symbols-outlined text-xl">edit</span>
                    <span>Edit Slide</span>
                  </button>
                  <button
                    className="flex-1 flex flex-col items-center justify-center gap-1 px-3 py-3 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-600 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 shadow-sm active:scale-95 transition hover:border-primary/50"
                    onClick={() => navigate(`/variations/${selectedSlideIndex}`)}
                  >
                    <span className="material-symbols-outlined text-xl">auto_fix_high</span>
                    <span>Variations</span>
                  </button>
                </div>
                <button
                  className="w-full py-3.5 bg-primary text-white font-bold rounded-xl shadow-lg active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
                  onClick={() => navigate('/export')}
                >
                  <span className="material-symbols-outlined text-xl">ios_share</span>
                  Export Deck
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

