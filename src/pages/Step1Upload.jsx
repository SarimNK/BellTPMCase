import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'

export default function Step1Upload() {
  const navigate = useNavigate()
  const { uploadedFiles, addFile, removeFile } = useStore()
  const [dragging, setDragging] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileSelect = (files) => {
    Array.from(files).forEach(file => {
      const fileObj = {
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
        file: file
      }
      addFile(fileObj)
    })
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const files = e.dataTransfer.files
    handleFileSelect(files)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragging(true)
  }

  const handleDragLeave = () => {
    setDragging(false)
  }

  const getFileIcon = (type) => {
    if (type.includes('pdf')) return 'picture_as_pdf'
    if (type.includes('word') || type.includes('document')) return 'description'
    if (type.includes('sheet') || type.includes('excel')) return 'table_chart'
    return 'image'
  }

  const getFileColorClasses = (type) => {
    if (type.includes('pdf')) {
      return {
        bg: 'bg-red-50 dark:bg-red-900/20',
        text: 'text-red-600'
      }
    }
    if (type.includes('word') || type.includes('document')) {
      return {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        text: 'text-blue-600'
      }
    }
    if (type.includes('sheet') || type.includes('excel')) {
      return {
        bg: 'bg-green-50 dark:bg-green-900/20',
        text: 'text-green-600'
      }
    }
    return {
      bg: 'bg-gray-50 dark:bg-gray-900/20',
      text: 'text-gray-600'
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100 flex flex-col min-h-screen transition-colors duration-200">
      <header className="sticky top-0 z-50 bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark shadow-sm">
        <div className="px-4 py-3 flex items-center justify-between">
          <button className="p-1 -ml-1" onClick={() => navigate(-1)}>
            <span className="material-symbols-outlined text-gray-600 dark:text-gray-400">arrow_back</span>
          </button>
          <h1 className="text-sm font-bold text-gray-900 dark:text-white">New Presentation</h1>
          <div className="w-8"></div>
        </div>
        <div className="px-6 py-4 flex justify-between items-center relative">
          <div className="absolute top-8 left-12 right-12 h-0.5 bg-gray-200 dark:bg-gray-700 -z-10"></div>
          <div className="flex flex-col items-center gap-1.5">
            <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shadow-sm">1</div>
            <span className="text-[10px] font-bold text-primary dark:text-secondary uppercase tracking-wider">Upload</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 flex items-center justify-center text-xs font-bold">2</div>
            <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Template</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 flex items-center justify-center text-xs font-bold">3</div>
            <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Processing</span>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 w-full pb-32">
        <div className="desktop-frame">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">Upload Source Materials</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            Upload documents to generate your slide deck. We support PDF, Word, Excel, and Images.
          </p>
        </div>

        <div
          className={`relative bg-white dark:bg-surface-dark border-2 border-dashed ${
            dragging ? 'border-primary' : 'border-primary/30 dark:border-primary/40'
          } rounded-2xl p-8 mb-8 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 hover:border-primary transition-all cursor-pointer shadow-sm group`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />
          <div className="flex flex-col items-center text-center">
            <div className="h-16 w-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <span className="material-symbols-outlined text-3xl text-primary">cloud_upload</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Tap to Browse</h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">or drag files here</p>
            <button
              className="mt-6 bg-primary hover:bg-blue-700 text-white text-sm font-semibold px-8 py-2.5 rounded-xl shadow-md transition-all active:scale-95"
              onClick={(e) => {
                e.stopPropagation()
                fileInputRef.current?.click()
              }}
            >
              Select Files
            </button>
            <div className="flex gap-3 mt-8 opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all">
              <span className="material-symbols-outlined text-gray-400 text-xl">picture_as_pdf</span>
              <span className="material-symbols-outlined text-gray-400 text-xl">description</span>
              <span className="material-symbols-outlined text-gray-400 text-xl">table_chart</span>
              <span className="material-symbols-outlined text-gray-400 text-xl">image</span>
            </div>
          </div>
        </div>

        {uploadedFiles.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Selected Files</h3>
            </div>
            <div className="space-y-3">
              {uploadedFiles.map((file, index) => {
                const colorClasses = getFileColorClasses(file.type)
                return (
                  <div
                    key={file.id}
                    className="bg-white dark:bg-surface-dark border border-gray-100 dark:border-border-dark p-3.5 rounded-xl shadow-sm flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 ${colorClasses.bg} rounded-lg flex items-center justify-center`}>
                        <span className={`material-symbols-outlined ${colorClasses.text} text-xl filled`}>
                          {getFileIcon(file.type)}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[180px]">
                          {file.name}
                        </h4>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <button
                      className="h-8 w-8 flex items-center justify-center text-gray-400 group-hover:text-red-500 transition-colors"
                      onClick={() => removeFile(index)}
                    >
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-surface-dark/80 backdrop-blur-md border-t border-gray-100 dark:border-border-dark p-4 px-6">
        <div className="max-w-lg mx-auto flex flex-col gap-3">
          <button
            className={`w-full font-bold py-3.5 rounded-xl text-sm transition-all ${
              uploadedFiles.length > 0
                ? 'bg-primary hover:bg-blue-700 text-white shadow-md active:scale-95'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            }`}
            disabled={uploadedFiles.length === 0}
            onClick={() => navigate('/template')}
          >
            Next Step
          </button>
          {uploadedFiles.length === 0 && (
            <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center">
              Please upload at least one file to continue
            </p>
          )}
        </div>
      </footer>
    </div>
  )
}

