import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { exportToPPTX } from '../utils/pptxExporter'

export default function ExportManagement() {
  const navigate = useNavigate()
  const { deck, internalUseOnly, setInternalUseOnly, reset, selectedTemplate } = useStore()
  const [showExportModal, setShowExportModal] = useState(false)
  const [reviewConfirmed, setReviewConfirmed] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleExport = () => {
    if (!reviewConfirmed) {
      setShowExportModal(true)
      return
    }
    exportToPPTX(deck, internalUseOnly, selectedTemplate?.id)
    setShowExportModal(false)
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete all project data? This cannot be undone.')) {
      reset()
      navigate('/upload')
    }
  }

  return (
    <div className="bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100 flex flex-col min-h-screen">
      <header className="shrink-0 bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center space-x-3">
          <button className="p-1 -ml-1 text-gray-500 dark:text-gray-400" onClick={() => navigate('/editor')}>
            <span className="material-symbols-outlined">arrow_back_ios</span>
          </button>
          <div>
            <h1 className="text-base font-bold text-gray-900 dark:text-white leading-tight">Export & Management</h1>
            <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400">Final Step</p>
          </div>
        </div>
        <button className="text-primary dark:text-blue-400 text-sm font-semibold" onClick={() => navigate('/editor')}>
          Cancel
        </button>
      </header>

      <main className="flex-1 overflow-y-auto pb-24">
        <div className="p-4 space-y-6 desktop-frame">
          <section className="space-y-4">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Deck Configuration</h2>
            <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-sm border border-border-light dark:border-border-dark divide-y divide-border-light dark:divide-border-dark">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-gray-400">branding_watermark</span>
                  <div>
                    <p className="text-sm font-semibold">Internal Use Only</p>
                    <p className="text-[11px] text-gray-500">Adds 'Bell Confidential' marks</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={internalUseOnly}
                    onChange={(e) => setInternalUseOnly(e.target.checked)}
                  />
                  <div className={`w-11 h-6 rounded-full transition-colors duration-200 ${internalUseOnly ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
                  <div className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${internalUseOnly ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </label>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-gray-400">verified</span>
                  <div>
                    <p className="text-sm font-semibold">Client-Ready</p>
                    <p className="text-[11px] text-gray-500">Removes all internal metadata</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={!internalUseOnly}
                    onChange={(e) => setInternalUseOnly(!e.target.checked)}
                  />
                  <div className={`w-11 h-6 rounded-full transition-colors duration-200 ${!internalUseOnly ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
                  <div className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${!internalUseOnly ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </label>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <button className="w-full flex items-center justify-between p-4 bg-white dark:bg-surface-dark border border-[var(--border-light)] dark:border-[var(--border-dark)] rounded-2xl shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-xl">gavel</span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold">Run Compliance Check</p>
                  <p className="text-[11px] text-gray-500">Simulate brand & legal scan</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-gray-400">chevron_right</span>
            </button>
          </section>

          <section className="space-y-4">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Compliance & Privacy</h2>
            <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-4">
              <div className="flex gap-3">
                <span className="material-symbols-outlined text-primary text-xl mt-0.5">shield_with_heart</span>
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-primary dark:text-blue-400">Secure Data Handling</p>
                  <p className="text-[12px] leading-relaxed text-gray-700 dark:text-gray-300">
                    Data is stored in Bell's private cloud for 30 days; all processing remains within sovereign borders.
                  </p>
                </div>
              </div>
            </div>
            <button
              className="w-full py-4 flex items-center justify-center gap-2 text-red-600 dark:text-red-400 font-semibold text-sm bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-2xl active:opacity-70 transition"
              onClick={handleDelete}
            >
              <span className="material-symbols-outlined text-lg">delete_forever</span>
              Delete All Project Data
            </button>
          </section>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-t border-border-light dark:border-border-dark">
        <div className="desktop-frame">
          <button
            className="w-full bg-primary hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition active:scale-[0.98]"
            onClick={handleExport}
          >
            <span className="material-symbols-outlined">present_to_all</span>
            Export as Editable .pptx
          </button>
          <p className="text-center text-[10px] text-gray-400 mt-3 font-medium">PowerPoint .pptx format supported in M365</p>
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div className="relative bg-white dark:bg-surface-dark w-full max-w-xs rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="material-symbols-outlined text-3xl text-primary">fact_check</span>
              </div>
              <h3 className="text-lg font-bold">Final Review Required</h3>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                <label className="flex gap-3 cursor-pointer group">
                  <div className="mt-0.5">
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary"
                      checked={reviewConfirmed}
                      onChange={(e) => setReviewConfirmed(e.target.checked)}
                    />
                  </div>
                  <span className="text-sm text-left text-gray-600 dark:text-gray-300 leading-snug">
                    I have reviewed the AI-generated content for accuracy and brand compliance.
                  </span>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  className="py-3 px-4 rounded-xl font-semibold text-gray-500 bg-gray-100 dark:bg-gray-800 dark:text-gray-400 text-sm cursor-pointer hover:bg-gray-200"
                  onClick={() => setShowExportModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="py-3 px-4 rounded-xl font-bold bg-primary text-white text-sm shadow-md active:scale-95 transition disabled:opacity-50"
                  onClick={handleExport}
                  disabled={!reviewConfirmed}
                >
                  Confirm Export
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

