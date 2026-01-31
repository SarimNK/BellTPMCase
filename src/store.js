import { create } from 'zustand'

export const useStore = create((set, get) => ({
  // Upload state
  uploadedFiles: [],
  addFile: (file) => set((state) => ({ 
    uploadedFiles: [...state.uploadedFiles, file] 
  })),
  removeFile: (index) => set((state) => ({
    uploadedFiles: state.uploadedFiles.filter((_, i) => i !== index)
  })),
  clearFiles: () => set({ uploadedFiles: [] }),

  // Template state
  selectedTemplate: null,
  setTemplate: (template) => set({ selectedTemplate: template }),
  templateTheme: 'bell-enterprise',
  setTemplateTheme: (theme) => set({ templateTheme: theme }),

  // Deck state
  deck: null,
  setDeck: (deck) => set({ deck }),
  updateSlide: (slideIndex, updates) => set((state) => {
    const newDeck = { ...state.deck }
    newDeck.slides[slideIndex] = { ...newDeck.slides[slideIndex], ...updates }
    return { deck: newDeck }
  }),

  // Version history
  versions: [],
  addVersion: (version) => set((state) => ({
    versions: [version, ...state.versions]
  })),
  setCurrentVersion: (versionId) => set((state) => ({
    deck: state.versions.find(v => v.id === versionId)?.deck || state.deck
  })),

  // Compare mode
  compareVersionId: null,
  setCompareVersion: (versionId) => set({ compareVersionId: versionId }),

  // Settings
  internalUseOnly: true,
  setInternalUseOnly: (value) => set({ internalUseOnly: value }),

  // Current slide being edited
  currentSlideIndex: 0,
  setCurrentSlideIndex: (index) => set({ currentSlideIndex: index }),

  // Delete all data
  reset: () => set({
    uploadedFiles: [],
    selectedTemplate: null,
    templateTheme: 'bell-enterprise',
    deck: null,
    versions: [],
    compareVersionId: null,
    internalUseOnly: true,
    currentSlideIndex: 0
  })
}))
