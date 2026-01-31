import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'

const templates = [
  {
    id: 'bell-enterprise',
    name: 'Bell Canada Template',
    category: 'Enterprise AI Study',
    slides: 18,
    verified: true,
    templateFile: 'BellCanadaTemplate.pptx',
    selected: true
  },
  {
    id: 'internal-strategy',
    name: 'Internal Strategy',
    category: 'Finance',
    slides: 12,
    verified: true,
    templateFile: '11b - alien minds - slides.pptx'
  },
  {
    id: 'quarterly-review',
    name: 'Quarterly Review',
    category: 'Executive',
    slides: 24,
    verified: true,
    templateFile: '1%2B-%2BIntroduction%2Bto%2B2244.pptx'
  }
]

export default function Step2Template() {
  const navigate = useNavigate()
  const { setTemplate, setTemplateTheme } = useStore()
  const [selectedId, setSelectedId] = useState('bell-enterprise')

  useEffect(() => {
    const defaultTemplate = templates.find(t => t.id === 'bell-enterprise')
    if (defaultTemplate) {
      setTemplate(defaultTemplate)
      setTemplateTheme(defaultTemplate.id)
      // Template file info is stored in the template object itself
      // The server will use templateFile property to load the actual PPTX
    }
  }, [setTemplate, setTemplateTheme])

  const handleSelect = (template) => {
    setSelectedId(template.id)
    setTemplate(template)
    setTemplateTheme(template.id)
    // Template file info is stored in the template object itself
    // The server will use templateFile property to load the actual PPTX
  }

  const handleConfirm = () => {
    const template = templates.find(t => t.id === selectedId)
    if (template) {
      setTemplate(template)
      navigate('/generate')
    }
  }

  return (
    <div className="bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100 min-h-screen flex flex-col transition-colors duration-200">
      <header className="sticky top-0 z-50 bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <button className="p-1 -ml-1 text-gray-600 dark:text-gray-400" onClick={() => navigate('/upload')}>
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-sm font-bold text-gray-900 dark:text-white">Select Brand Template</h1>
          <div className="w-8"></div>
        </div>
        <div className="flex items-center justify-between max-w-xs mx-auto px-4">
          <div className="flex flex-col items-center gap-1">
            <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-[10px] font-bold">
              <span className="material-symbols-outlined text-sm">check</span>
            </div>
            <span className="text-[10px] font-medium text-green-600">Upload</span>
          </div>
          <div className="flex-1 h-[2px] bg-primary mx-2 -mt-4"></div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">2</div>
            <span className="text-[10px] font-bold text-primary">Select</span>
          </div>
          <div className="flex-1 h-[2px] bg-gray-200 dark:bg-gray-700 mx-2 -mt-4"></div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 flex items-center justify-center text-xs font-bold">3</div>
            <span className="text-[10px] font-medium text-gray-400">Customize</span>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-4 w-full pb-32">
        <div className="desktop-frame">
        <div className="mb-6 space-y-4">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">search</span>
            <input
              className="w-full pl-10 pr-12 py-3 bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="Search templates..."
              type="text"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
            <button className="px-5 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full text-xs font-semibold whitespace-nowrap">
              All
            </button>
            <button className="px-5 py-2 bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark text-gray-600 dark:text-gray-300 rounded-full text-xs font-medium whitespace-nowrap">
              Sales
            </button>
            <button className="px-5 py-2 bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark text-gray-600 dark:text-gray-300 rounded-full text-xs font-medium whitespace-nowrap">
              Executive
            </button>
            <button className="px-5 py-2 bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark text-gray-600 dark:text-gray-300 rounded-full text-xs font-medium whitespace-nowrap">
              Internal
            </button>
          </div>
        </div>


        <div className="grid grid-cols-2 gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className={`group relative flex flex-col bg-white dark:bg-surface-dark rounded-xl border-2 ${
                selectedId === template.id
                  ? 'border-primary'
                  : 'border-gray-200 dark:border-border-dark hover:border-primary/50'
              } overflow-hidden shadow-md transition-all cursor-pointer`}
              onClick={() => handleSelect(template)}
            >
              <div className="h-28 bg-primary/10 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-16 bg-white dark:bg-gray-700 shadow-sm rounded flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary filled">check_circle</span>
                    </div>
                  </div>
                </div>
                {template.verified && (
                  <div className="absolute top-2 left-2 bg-white/90 dark:bg-gray-800/90 text-primary dark:text-secondary text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow-sm">
                    <span className="material-symbols-outlined text-[11px] filled">verified</span>
                    Verified
                  </div>
                )}
              </div>
              <div className="p-3">
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">{template.name}</h4>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                  {template.category} • {template.slides} Slides
                </p>
              </div>
            </div>
          ))}
        </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white dark:bg-surface-dark border-t border-border-light dark:border-border-dark px-6 py-4 pb-8 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        <div className="max-w-lg mx-auto flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Selected</span>
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              {templates.find(t => t.id === selectedId)?.name || 'None'}
            </span>
          </div>
          <button
            className="flex-1 max-w-[200px] bg-primary hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
            onClick={handleConfirm}
          >
            Confirm Template
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </button>
        </div>
      </footer>
    </div>
  )
}

