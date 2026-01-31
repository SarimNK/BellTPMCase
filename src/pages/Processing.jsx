import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { generateSlidesWithGroq } from '../utils/groqService'

export default function Processing() {
  const navigate = useNavigate()
  const { uploadedFiles, selectedTemplate, setDeck, addVersion } = useStore()
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [statusMessage, setStatusMessage] = useState('Initializing...')
  const [error, setError] = useState(null)

  const steps = [
    { id: 0, title: 'Extracting content from files', description: 'Reading uploaded documents...' },
    { id: 1, title: 'Analyzing content', description: 'Identifying key themes and data points...' },
    { id: 2, title: 'Generating slides', description: 'Creating slide structure with AI...' },
    { id: 3, title: 'Finalizing deck', description: 'Applying template and formatting...' }
  ]

  useEffect(() => {
    if (uploadedFiles.length === 0) {
      navigate('/upload')
      return
    }

    // Start the generation process
    generateDeck()
  }, [])

  const generateDeck = async () => {
    try {
      setError(null)
      
      // Update progress and steps
      const updateProgress = (progressValue, message) => {
        setProgress(progressValue)
        setStatusMessage(message || 'Processing...')
        
        // Update current step based on progress
        if (progressValue < 30) {
          setCurrentStep(0)
        } else if (progressValue < 60) {
          setCurrentStep(1)
        } else if (progressValue < 90) {
          setCurrentStep(2)
        } else {
          setCurrentStep(3)
        }
      }

      updateProgress(5, 'Starting generation process...')

      // Call Groq API to generate slides
      // Template info is now read from template-maps.json using selectedTemplate.id
      const deck = await generateSlidesWithGroq(
        uploadedFiles,
        selectedTemplate,
        null, // Template file is loaded from resources based on template id
        updateProgress
      )

      updateProgress(100, 'Generation complete!')

      // Save the deck
      setDeck(deck)
      
      // Add as version 1
      addVersion({
        id: Date.now(),
        timestamp: new Date().toISOString(),
        name: 'Version 1 - AI Generated',
        deck: JSON.parse(JSON.stringify(deck))
      })

      // Navigate to editor after a short delay
      setTimeout(() => {
        navigate('/editor')
      }, 1000)

    } catch (error) {
      console.error('Error generating deck:', error)
      setError(error.message || 'Failed to generate presentation. Please try again.')
      setStatusMessage('Error occurred')
    }
  }

  const estimatedTime = Math.max(0, Math.ceil((100 - progress) / 3))

  return (
    <div className="bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100 min-h-screen flex flex-col transition-colors duration-200">
      <header className="sticky top-0 z-50 bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <button 
            className="p-1 -ml-1 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
            onClick={() => navigate('/generate')}
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h1 className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
              {selectedTemplate?.name || 'Generating Presentation'}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Generating Presentation...</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden border border-border-light dark:border-border-dark">
            <div className="h-full w-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
              JD
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-10 w-full">
        <div className="desktop-frame w-full">
        {error ? (
          <div className="w-full text-center space-y-4">
            <div className="inline-flex items-center justify-center p-4 bg-red-50 dark:bg-red-900/20 rounded-full mb-6">
              <span className="material-symbols-outlined text-4xl text-red-600">error</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Generation Failed</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">{error}</p>
            <div className="flex gap-3 justify-center">
              <button
                className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-blue-700 transition"
                onClick={() => {
                  setError(null)
                  setProgress(0)
                  setCurrentStep(0)
                  generateDeck()
                }}
              >
                Try Again
              </button>
              <button
                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                onClick={() => navigate('/generate')}
              >
                Go Back
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="w-full text-center mb-10">
              <div className="inline-flex items-center justify-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-full mb-6 relative">
                <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin w-full h-full"></div>
                <span className="material-symbols-outlined text-4xl text-primary relative z-10">auto_awesome</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Synthesizing Source Materials...</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{statusMessage}</p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-1 mt-4 overflow-hidden">
                <div
                  className="bg-primary h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium">
                <span>Processing</span>
                <span>{Math.round(progress)}%</span>
              </div>
            </div>

            <div className="w-full space-y-0 relative">
              <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`relative flex items-start gap-4 pb-8 group ${
                    index === steps.length - 1 ? '' : ''
                  } ${index > currentStep ? 'opacity-50' : ''}`}
                >
                  <div className="relative z-10 flex-shrink-0">
                    {index < currentStep ? (
                      <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center border-2 border-green-500 dark:border-green-400">
                        <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-lg">check</span>
                      </div>
                    ) : index === currentStep ? (
                      <div className="h-8 w-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center border-2 border-primary animate-pulse">
                        <span className="material-symbols-outlined text-primary text-lg">sync</span>
                      </div>
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center border-2 border-gray-300 dark:border-gray-600">
                        <span className="material-symbols-outlined text-gray-400 text-lg">pending</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 pt-1">
                    <h3
                      className={`text-sm font-semibold ${
                        index === currentStep
                          ? 'text-primary'
                          : index < currentStep
                          ? 'text-gray-900 dark:text-gray-100'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {step.title}
                    </h3>
                    <p
                      className={`text-xs mt-0.5 ${
                        index === currentStep
                          ? 'text-primary/80'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {index === currentStep ? statusMessage : step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-auto pt-10 w-full text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/30">
                <span className="material-symbols-outlined text-primary text-lg">timer</span>
                <span className="text-xs font-medium text-primary">
                  {progress < 100 ? `Estimated time remaining: ${estimatedTime} seconds` : 'Almost done...'}
                </span>
              </div>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-3 max-w-xs mx-auto">
                This draft will require human review for accuracy.
              </p>
            </div>
          </>
        )}
        </div>
      </main>
    </div>
  )
}
