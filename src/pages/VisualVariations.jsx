import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../store'

export default function VisualVariations() {
  const navigate = useNavigate()
  const { index } = useParams()
  const slideIndex = parseInt(index) || 0
  const { deck } = useStore()

  const variations = [
    {
      id: 1,
      name: 'Data Focused',
      type: 'Analytics Layout',
      icon: 'bar_chart',
      description: 'Chart-forward layout optimized for data visualization'
    },
    {
      id: 2,
      name: 'Visual Storytelling',
      type: 'Impact Layout',
      icon: 'photo_library',
      description: 'Image-heavy layout for narrative presentations'
    }
  ]

  const handleApplyVariation = (variationId) => {
    // In a real app, this would update the slide's layout
    navigate(`/slide/${slideIndex}`)
  }

  return (
    <div className="bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100 min-h-screen flex flex-col transition-colors duration-200 overflow-hidden">
      <div className="fixed inset-0 opacity-40 pointer-events-none scale-95 blur-[2px]">
        <header className="bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark px-4 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3">
            <span className="material-symbols-outlined text-gray-400">arrow_back</span>
            <div>
              <h1 className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">Editing Slide {slideIndex + 1}</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Zoomed-in Editor</p>
            </div>
          </div>
        </header>
      </div>

      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div className="bg-surface-light dark:bg-surface-dark w-full max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border-t border-x border-white/20 sm:border">
          <div className="px-6 pt-6 pb-4 border-b border-border-light dark:border-border-dark">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Slide Visual Variations</h2>
              <button
                className="p-2 -mr-2 text-gray-400 hover:text-gray-600 dark:hover:text-white"
                onClick={() => navigate(`/slide/${slideIndex}`)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Select a layout style for <span className="font-semibold text-gray-700 dark:text-gray-200">
                "{deck?.slides[slideIndex]?.title || 'Slide'}"
              </span>
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6 no-scrollbar">
            {variations.map((variation) => (
              <div key={variation.id} className="variation-card group relative">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-primary dark:text-blue-400 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">{variation.icon}</span>
                    Variation {variation.id}: {variation.name}
                  </h3>
                  <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full uppercase">
                    {variation.type}
                  </span>
                </div>
                <div className="relative overflow-hidden rounded-xl border-2 border-border-light dark:border-border-dark group-hover:border-primary transition-all duration-300">
                  <div className="zoom-preview aspect-[16/9] bg-white dark:bg-gray-900 p-4 transition-transform duration-500 ease-out flex flex-col">
                    {variation.id === 1 ? (
                      <>
                        <div className="w-1/2 h-2 bg-primary rounded-full mb-4"></div>
                        <div className="flex flex-1 gap-3">
                          <div className="flex-[3] bg-blue-50 dark:bg-blue-900/20 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-primary/20">
                            <span className="material-symbols-outlined text-primary/40 text-4xl">insert_chart</span>
                            <span className="text-[10px] text-primary/40 font-bold mt-2">Q2 PERFORMANCE CHART</span>
                          </div>
                          <div className="flex-[2] space-y-2 pt-2">
                            <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                            <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                            <div className="h-1.5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="relative flex flex-col justify-end h-full bg-gray-900">
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                        <div className="relative p-6">
                          <div className="w-4/5 h-4 bg-white rounded mb-2"></div>
                          <div className="w-2/3 h-4 bg-white/70 rounded"></div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                    <button
                      className="bg-primary text-white px-6 py-2 rounded-full text-xs font-bold shadow-xl transform translate-y-2 group-hover:translate-y-0 transition-all duration-300"
                      onClick={() => handleApplyVariation(variation.id)}
                    >
                      Apply This Variation
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 border-t border-border-light dark:border-border-dark bg-gray-50/50 dark:bg-gray-800/20">
            <button className="w-full py-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 shadow-sm flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
              <span className="material-symbols-outlined text-lg">auto_fix_high</span>
              Generate More Styles
            </button>
            <p className="text-[10px] text-center text-gray-400 mt-4 uppercase tracking-widest font-medium">
              Rapid Visual Iteration Engine
            </p>
          </div>
          <div className="h-6 w-full"></div>
        </div>
      </div>
    </div>
  )
}

