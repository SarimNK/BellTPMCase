import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'

export default function Step3Generate() {
  const navigate = useNavigate()
  const { uploadedFiles, selectedTemplate, templateFile } = useStore()

  const handleGenerate = () => {
    navigate('/processing')
  }

  return (
    <div className="bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100 min-h-screen flex flex-col transition-colors duration-200">
      <header className="sticky top-0 z-50 bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <button className="text-gray-500 hover:text-primary transition" onClick={() => navigate('/template')}>
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h1 className="text-sm font-bold text-gray-900 dark:text-white leading-none tracking-tight">
              Step 3: Generate Draft
            </h1>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium tracking-wide uppercase mt-0.5">
              Final Review
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shadow-sm ring-2 ring-white dark:ring-gray-800">
            JD
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 w-full flex flex-col">
        <div className="desktop-frame flex flex-col">
        <div className="flex items-center justify-center mb-8 px-4">
          <div className="flex items-center w-full max-w-xs">
            <div className="flex flex-col items-center">
              <div className="w-7 h-7 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mb-1">
                <span className="material-symbols-outlined text-sm">check</span>
              </div>
              <span className="text-[10px] text-gray-400 font-medium">Upload</span>
            </div>
            <div className="flex-1 h-0.5 bg-green-500 mx-2 mb-4"></div>
            <div className="flex flex-col items-center">
              <div className="w-7 h-7 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mb-1">
                <span className="material-symbols-outlined text-sm">check</span>
              </div>
              <span className="text-[10px] text-gray-400 font-medium">Select</span>
            </div>
            <div className="flex-1 h-0.5 bg-primary/30 mx-2 mb-4"></div>
            <div className="flex flex-col items-center">
              <div className="w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold mb-1 ring-4 ring-primary/20">
                3
              </div>
              <span className="text-[10px] text-primary font-bold">Generate</span>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Ready to generate</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Review your selections before the AI builds your presentation draft.
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="bg-white dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-border-dark p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">description</span>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider text-[11px]">
                  Selected Content
                </h3>
              </div>
              <button className="text-[11px] text-primary font-bold" onClick={() => navigate('/upload')}>
                Edit
              </button>
            </div>
            <div className="space-y-2">
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-800"
                >
                  <div className="h-10 w-10 bg-red-50 dark:bg-red-900/20 rounded flex items-center justify-center text-red-600">
                    <span className="material-symbols-outlined">picture_as_pdf</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{file.name}</p>
                    <p className="text-[10px] text-gray-500">
                      {(file.size / (1024 * 1024)).toFixed(1)} MB
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-border-dark p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">grid_view</span>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider text-[11px]">
                  Selected Template
                </h3>
              </div>
              <button className="text-[11px] text-primary font-bold" onClick={() => navigate('/template')}>
                Change
              </button>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-24 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden relative">
                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                  <div className="w-16 h-10 bg-primary/20 rounded shadow-sm"></div>
                </div>
                <div className="absolute top-1 right-1">
                  <span className="material-symbols-outlined text-[12px] text-green-600 filled">verified</span>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                  {selectedTemplate?.name || 'No template selected'}
                </h4>
                <p className="text-[10px] text-gray-500">
                  {selectedTemplate?.category || ''} • {selectedTemplate?.slides || 0} Slides
                </p>
                {templateFile && (
                  <p className="text-[10px] text-gray-500 mt-1">
                    Template PDF: <span className="font-medium text-gray-700 dark:text-gray-300">{templateFile.name}</span>
                  </p>
                )}
                <div className="mt-1 flex items-center gap-1">
                  <span className="text-[9px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded font-bold uppercase">
                    Compliance Verified
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto space-y-4">
          <button
            className="w-full bg-primary hover:bg-blue-700 text-white py-4 px-6 rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-3 transition-all transform active:scale-[0.98]"
            onClick={handleGenerate}
          >
            <span className="material-symbols-outlined text-2xl">auto_awesome</span>
            <span className="text-base font-bold">Generate Presentation Draft</span>
          </button>
          <div className="flex gap-2 items-start px-2">
            <span className="material-symbols-outlined text-gray-400 text-sm mt-0.5">info</span>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed italic">
              You will be able to refine the outline and individual slides in the next step.
            </p>
          </div>
        </div>
        </div>
      </main>

      <footer className="text-center px-6 py-4 bg-transparent mt-4 pb-8">
        <p className="text-[10px] text-gray-400 dark:text-gray-500 max-w-xs mx-auto leading-tight">
          Content is processed for draft generation; review before sharing.
        </p>
      </footer>
    </div>
  )
}

