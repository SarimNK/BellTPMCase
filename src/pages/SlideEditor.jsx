import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../store'
import { getTemplateTheme } from '../utils/templateThemes'
import { regenerateBulletPoint, regenerateSlideTitle } from '../utils/groqRegenerate'

export default function SlideEditor() {
  const navigate = useNavigate()
  const { index } = useParams()
  const slideIndex = parseInt(index) || 0
  const { deck, updateSlide, setCompareVersion, compareVersionId, versions, addVersion, selectedTemplate } = useStore()
  const [showVersionSidebar, setShowVersionSidebar] = useState(false)
  const [comparing, setComparing] = useState(false)
  const [regenerating, setRegenerating] = useState({ title: false, bullets: {} })
  const theme = getTemplateTheme(selectedTemplate)

  useEffect(() => {
    if (deck && deck.slides[slideIndex]) {
      setCurrentSlide(deck.slides[slideIndex])
    }
  }, [slideIndex, deck])

  const [currentSlide, setCurrentSlide] = useState(
    deck?.slides[slideIndex] || {
      title: '',
      bullets: [],
      confidence: 0
    }
  )

  const compareVersion = versions.find(v => v.id === compareVersionId)
  const compareSlide = compareVersion?.deck?.slides[slideIndex]

  const handleTitleChange = (value) => {
    const updated = { ...currentSlide, title: value }
    setCurrentSlide(updated)
    updateSlide(slideIndex, { title: value })
  }

  const handleBulletChange = (index, value) => {
    const newBullets = [...currentSlide.bullets]
    newBullets[index] = value
    const updated = { ...currentSlide, bullets: newBullets }
    setCurrentSlide(updated)
    updateSlide(slideIndex, { bullets: newBullets })
  }

  const handleAddBullet = () => {
    const newBullets = [...currentSlide.bullets, '']
    const updated = { ...currentSlide, bullets: newBullets }
    setCurrentSlide(updated)
    updateSlide(slideIndex, { bullets: newBullets })
  }

  const handleRemoveBullet = (index) => {
    const newBullets = currentSlide.bullets.filter((_, i) => i !== index)
    const updated = { ...currentSlide, bullets: newBullets }
    setCurrentSlide(updated)
    updateSlide(slideIndex, { bullets: newBullets })
  }

  const handleSaveVersion = () => {
    addVersion({
      id: Date.now(),
      timestamp: new Date().toISOString(),
      name: `Version ${versions.length + 1}`,
      deck: JSON.parse(JSON.stringify(deck))
    })
  }

  const handleRestoreVersion = (versionId) => {
    const version = versions.find(v => v.id === versionId)
    if (version) {
      // Restore the entire deck
      useStore.getState().setDeck(JSON.parse(JSON.stringify(version.deck)))
      setShowVersionSidebar(false)
    }
  }

  const handleRegenerateTitle = async () => {
    setRegenerating({ ...regenerating, title: true })
    try {
      const context = currentSlide.bullets.join(' ') || 'Bell Canada presentation slide'
      const newTitle = await regenerateSlideTitle(context, currentSlide.title)
      handleTitleChange(newTitle)
    } catch (error) {
      console.error('Error regenerating title:', error)
    } finally {
      setRegenerating({ ...regenerating, title: false })
    }
  }

  const handleRegenerateBullet = async (bulletIndex) => {
    setRegenerating({ ...regenerating, bullets: { ...regenerating.bullets, [bulletIndex]: true } })
    try {
      const context = `${currentSlide.title}. Other points: ${currentSlide.bullets.filter((_, i) => i !== bulletIndex).join(' ')}`
      const currentBullet = currentSlide.bullets[bulletIndex]
      const newBullet = await regenerateBulletPoint(context, currentBullet)
      handleBulletChange(bulletIndex, newBullet)
    } catch (error) {
      console.error('Error regenerating bullet:', error)
    } finally {
      setRegenerating({ ...regenerating, bullets: { ...regenerating.bullets, [bulletIndex]: false } })
    }
  }

  return (
    <div className="bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100 min-h-screen flex flex-col transition-colors duration-200 overflow-x-hidden">
      <header className="sticky top-0 z-[60] bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <button className="p-1 -ml-1 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full" onClick={() => navigate('/editor')}>
            <span className="material-icons-outlined">arrow_back</span>
          </button>
          <div>
            <h1 className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">Editing Slide {slideIndex + 1}</h1>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-green-600 dark:text-green-400 font-bold uppercase tracking-wide">
                {currentSlide.confidence}% Confidence
              </span>
              <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">Ver. {versions.length + 1}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center gap-2 mr-1">
            <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">Compare</span>
            <button
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                comparing ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
              }`}
              onClick={() => {
                setComparing(!comparing)
                if (!comparing && versions.length > 0) {
                  setCompareVersion(versions[0].id)
                } else {
                  setCompareVersion(null)
                }
              }}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                  comparing ? 'translate-x-4.5' : 'translate-x-0.5'
                }`}
              ></span>
            </button>
          </div>
          <button
            className="p-2 text-primary dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-full relative"
            onClick={() => setShowVersionSidebar(!showVersionSidebar)}
          >
            <span className="material-icons-outlined text-xl">history</span>
            {versions.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></span>
            )}
          </button>
        </div>
      </header>

      <main className={`flex-1 px-4 py-6 pb-44 w-full relative ${theme.chromeBg}`}>
        <div className="desktop-frame">
        {comparing && compareSlide && (
          <div className="mb-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[18px]">difference</span>
              <span className="text-xs font-medium text-blue-800 dark:text-blue-300">
                Comparing to <span className="font-bold">Version {versions.findIndex(v => v.id === compareVersionId) + 1}</span>
              </span>
            </div>
            <button
              className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-widest border border-blue-200 dark:border-blue-700 bg-white dark:bg-gray-800 px-2 py-1 rounded"
              onClick={() => {
                setComparing(false)
                setCompareVersion(null)
              }}
            >
              Reset
            </button>
          </div>
        )}

        <div className={`rounded-xl overflow-hidden ${theme.panelBg} ${theme.panelBorder} ${theme.panelShadow}`}>
          {/* Template accent header */}
          <div className={`h-1.5 ${theme.headerAccent}`}></div>
          
          <div className={`p-6 border-b border-gray-200/50 ${theme.slideBackground}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded ${theme.headerAccent}`}></div>
                <span className={`text-xs font-bold uppercase tracking-wider ${theme.titleText}`}>
                  Slide {slideIndex + 1} • {theme.templateName || 'Content'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-50 border border-green-100 rounded-full">
                  <span className="material-icons-round text-green-600 text-xs">verified</span>
                  <span className="text-[10px] font-bold text-green-700 uppercase tracking-wide">
                    {currentSlide.confidence}% Match
                  </span>
                </div>
                <button
                  className="text-gray-400 hover:text-primary transition p-1 disabled:opacity-50"
                  title="Regenerate Title"
                  onClick={handleRegenerateTitle}
                  disabled={regenerating.title}
                >
                  <span className={`material-icons-outlined text-sm ${regenerating.title ? 'animate-spin' : ''}`}>
                    {regenerating.title ? 'sync' : 'auto_awesome'}
                  </span>
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs text-gray-500 font-medium uppercase tracking-wide">Slide Title</label>
            </div>
            <div className="relative">
              <input
                className={`w-full bg-transparent border-b-2 border-gray-200 ${theme.titleSize} ${theme.titleText} p-0 pb-2 focus:ring-0 focus:border-current transition`}
                type="text"
                value={currentSlide.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Enter slide title..."
              />
              <div className={`absolute bottom-0 left-0 h-0.5 w-16 ${theme.headerAccent} rounded-full`}></div>
            </div>
          </div>

          <div className={`p-6 ${theme.slideBackground}`}>
            {/* Content area - two column when image present */}
            <div className={`flex ${currentSlide.image_data ? 'gap-6' : ''} ${currentSlide.image_data && currentSlide.image_position === 'left' ? 'flex-row-reverse' : ''}`}>
              {/* Bullets section */}
              <div className={`space-y-5 ${currentSlide.image_data ? 'flex-1' : 'w-full'}`}>
                <label className="block text-xs text-gray-500 font-medium uppercase tracking-wide">Bullet Points</label>
              {currentSlide.bullets.map((bullet, index) => {
                const compareBullet = compareSlide?.bullets?.[index]
                const isChanged = comparing && compareBullet && compareBullet !== bullet
                return (
                  <div key={index} className="relative group">
                    <div className="flex items-start gap-4">
                      <div className={`mt-2.5 w-2.5 h-2.5 rounded-full ${theme.bulletDot} flex-shrink-0`}></div>
                      <div className="flex-1">
                        {isChanged && (
                          <div className="text-[10px] text-red-500 line-through mb-1 opacity-70">{compareBullet}</div>
                        )}
                        <textarea
                          className={`w-full bg-transparent border border-transparent focus:border-current rounded-lg ${theme.bodyText} p-0 focus:ring-0 resize-none transition leading-relaxed ${
                            isChanged ? 'bg-green-50/30' : ''
                          }`}
                          rows="1"
                          value={bullet}
                          onChange={(e) => handleBulletChange(index, e.target.value)}
                          placeholder="Enter bullet point..."
                        />
                      </div>
                      <div className="flex flex-col gap-1 pt-1">
                        <button
                          className={`p-1.5 rounded-lg disabled:opacity-50 transition`}
                          style={{ backgroundColor: `${theme.accentColor}15`, color: theme.accentColor }}
                          title="Regenerate"
                          onClick={() => handleRegenerateBullet(index)}
                          disabled={regenerating.bullets[index]}
                        >
                          <span className={`material-icons-round text-sm ${regenerating.bullets[index] ? 'animate-spin' : ''}`}>
                            {regenerating.bullets[index] ? 'sync' : 'auto_awesome'}
                          </span>
                        </button>
                        <button
                          className="p-1.5 text-gray-400 hover:text-red-500 transition"
                          title="Delete"
                          onClick={() => handleRemoveBullet(index)}
                        >
                          <span className="material-icons-outlined text-sm">close</span>
                        </button>
                      </div>
                    </div>
                    {isChanged && (
                      <div className="absolute -left-5 top-0 bottom-0 w-1 bg-green-500 rounded-full"></div>
                    )}
                  </div>
                )
              })}
            </div>
                <div className="flex gap-2 pt-4">
                  <button
                    className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-primary bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 transition"
                    onClick={handleAddBullet}
                  >
                    <span className="material-icons-outlined text-sm">add</span>
                    <span>Add Point</span>
                  </button>
                </div>
              </div>
              
              {/* Image section - shown alongside bullets */}
              {currentSlide.image_data && (
                <div className="w-2/5 flex flex-col shrink-0">
                  <label className="block text-xs text-gray-500 font-medium uppercase tracking-wide mb-3">Slide Image</label>
                  {/* Image position toggle */}
                  <div className="flex gap-2 mb-3">
                    <button
                      className={`px-3 py-1.5 rounded text-xs font-medium transition ${currentSlide.image_position === 'left' ? 'bg-primary text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-600'}`}
                      onClick={() => {
                        updateSlide(slideIndex, { image_position: 'left' })
                        setCurrentSlide({ ...currentSlide, image_position: 'left' })
                      }}
                    >
                      Left
                    </button>
                    <button
                      className={`px-3 py-1.5 rounded text-xs font-medium transition ${!currentSlide.image_position || currentSlide.image_position === 'right' ? 'bg-primary text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-600'}`}
                      onClick={() => {
                        updateSlide(slideIndex, { image_position: 'right' })
                        setCurrentSlide({ ...currentSlide, image_position: 'right' })
                      }}
                    >
                      Right
                    </button>
                    <button
                      className="px-3 py-1.5 rounded text-xs font-medium bg-red-100 hover:bg-red-200 text-red-600 ml-auto transition"
                      onClick={() => {
                        updateSlide(slideIndex, { image_data: null, image_ref: null })
                        setCurrentSlide({ ...currentSlide, image_data: null, image_ref: null })
                      }}
                    >
                      Remove
                    </button>
                  </div>
                  <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <img 
                      src={currentSlide.image_data} 
                      alt="Slide visual"
                      className="max-w-full max-h-[280px] object-contain rounded-lg shadow-md"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {currentSlide.sourceEvidence && (
            <div className="bg-gray-50 dark:bg-gray-800/40 border-t border-border-light dark:border-border-dark p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="material-icons-outlined text-gray-500 text-sm">description</span>
                  <span className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Source Evidence</span>
                </div>
                <span className="text-[10px] font-mono text-gray-400 bg-white dark:bg-gray-700 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-600">
                  Page {currentSlide.sourceEvidence.page}
                </span>
              </div>
              <div className="flex gap-4">
                <div className="w-16 h-20 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-sm rounded flex flex-col p-1.5 gap-1 flex-shrink-0 relative overflow-hidden">
                  <div className="w-full h-1 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
                  <div className="w-3/4 h-1 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
                  <div className="w-full h-1 bg-gray-200 dark:bg-gray-600 rounded-full mt-1"></div>
                  <div className="w-full h-1 bg-yellow-100 dark:bg-yellow-900/30 rounded-full"></div>
                  <div className="w-5/6 h-1 bg-yellow-200 dark:bg-yellow-600 rounded-full"></div>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-600 dark:text-gray-300 font-serif italic leading-relaxed bg-white dark:bg-gray-800 p-2 rounded border border-gray-100 dark:border-gray-700">
                    {currentSlide.sourceEvidence.text}
                  </p>
                  <div className="mt-2.5 flex items-start gap-2">
                    <span className="material-icons-outlined text-[14px] text-primary dark:text-blue-400 mt-0.5">verified_user</span>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug">
                      <span className="font-semibold text-primary dark:text-blue-400">Trust Note:</span>
                      AI extracted this specific data point with high certainty from{' '}
                      <span className="font-medium text-gray-700 dark:text-gray-300">page {currentSlide.sourceEvidence.page}</span> of the{' '}
                      <span className="font-medium text-gray-700 dark:text-gray-300">"Q3 Report"</span>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Version Sidebar */}
      <div
        className={`fixed inset-y-0 right-0 w-80 bg-surface-light dark:bg-surface-dark shadow-2xl z-[100] transform transition-transform duration-300 ease-in-out border-l border-border-light dark:border-border-dark flex flex-col ${
          showVersionSidebar ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-border-light dark:border-border-dark flex items-center justify-between">
          <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">history</span>
            Version History
          </h2>
          <button
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
            onClick={() => setShowVersionSidebar(false)}
          >
            <span className="material-icons-outlined">close</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          <div className="p-3 rounded-lg border-2 border-primary bg-blue-50/50 dark:bg-blue-900/10 relative">
            <div className="flex justify-between items-start mb-1">
              <span className="text-xs font-bold text-primary dark:text-blue-400 uppercase">Version {versions.length + 1} (Current)</span>
              <span className="text-[10px] text-gray-400 uppercase">Just Now</span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-200 font-medium">Current Version</p>
          </div>
          {versions.map((version, idx) => (
            <div key={version.id} className="p-3 rounded-lg border border-border-light dark:border-border-dark hover:bg-gray-50 dark:hover:bg-gray-800/40 transition group">
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">Version {versions.length - idx}</span>
                <span className="text-[10px] text-gray-400 uppercase">
                  {new Date(version.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-200">{version.name}</p>
              <div className="mt-3 flex gap-2">
                <button
                  className="flex-1 py-1.5 px-2 bg-primary text-white text-[10px] font-bold rounded uppercase tracking-wider"
                  onClick={() => handleRestoreVersion(version.id)}
                >
                  Restore
                </button>
                <button
                  className="px-2 py-1.5 border border-border-light dark:border-border-dark rounded text-[10px] font-bold text-gray-600 dark:text-gray-300 uppercase"
                  onClick={() => {
                    setCompareVersion(version.id)
                    setComparing(true)
                    setShowVersionSidebar(false)
                  }}
                >
                  Preview
                </button>
              </div>
            </div>
          ))}
          <div className="mt-6 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-xl p-3">
            <label className="block text-[10px] font-bold text-primary dark:text-blue-400 uppercase tracking-widest mb-2">
              Iterate on this version
            </label>
            <div className="relative">
              <textarea
                className="w-full bg-white dark:bg-gray-800 border border-border-light dark:border-border-dark rounded-lg text-xs p-2.5 focus:ring-1 focus:ring-primary focus:border-primary resize-none pr-10"
                placeholder="Suggest changes to the AI..."
                rows="3"
              ></textarea>
              <button className="absolute bottom-2 right-2 p-1.5 bg-primary text-white rounded-md">
                <span className="material-icons-round text-sm">auto_awesome</span>
              </button>
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-border-light dark:border-border-dark bg-gray-50 dark:bg-gray-800/50">
          <button
            className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-xs font-medium text-gray-500 hover:border-primary hover:text-primary transition flex items-center justify-center gap-2"
            onClick={handleSaveVersion}
          >
            <span className="material-icons-outlined text-sm">save</span>
            Save Manual Snapshot
          </button>
        </div>
      </div>

      <div className={`fixed bottom-0 left-0 right-0 ${theme.aiPanelBg} border-t border-border-light dark:border-border-dark p-4 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] pb-8`}>
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button
            className="flex-1 py-3 px-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            onClick={() => navigate('/editor')}
          >
            Back to Deck View
          </button>
          <button
            className="flex-[2] py-3 px-4 rounded-lg bg-primary text-white font-semibold text-sm shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition flex items-center justify-center gap-2"
            onClick={() => navigate('/editor')}
          >
            <span className="material-icons-round text-base">check</span>
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  )
}

