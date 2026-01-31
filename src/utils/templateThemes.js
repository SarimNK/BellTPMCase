export function getTemplateTheme(template) {
  const id = template?.id || 'bell-enterprise'

  // Bell Canada Template - Clean corporate blue style
  if (id === 'bell-enterprise') {
    return {
      // Slide panel styling
      panelBg: 'bg-white',
      panelBorder: 'border-0',
      panelShadow: 'shadow-xl ring-1 ring-gray-200',
      slideBackground: 'bg-gradient-to-br from-white via-white to-blue-50/30',
      headerAccent: 'bg-gradient-to-r from-[#005596] to-[#0078C8]',
      // Typography
      titleText: 'text-[#005596]',
      titleSize: 'text-3xl md:text-[36px] font-bold',
      bulletDot: 'bg-[#005596]',
      bodyText: 'text-base md:text-lg text-gray-700',
      // Chrome/UI styling
      chromeBg: 'bg-gradient-to-b from-gray-50 to-gray-100',
      sidebarBg: 'bg-white',
      sidebarItem: 'bg-gradient-to-br from-white to-blue-50/50 border border-gray-200 shadow-sm',
      sidebarActive: 'border-[#005596] bg-blue-50 ring-2 ring-[#005596]/20',
      aiPanelBg: 'bg-white',
      aiPanelHeaderBg: 'bg-gradient-to-r from-blue-50 to-white',
      footerText: 'text-[10px] text-gray-400 uppercase tracking-[0.2em] font-semibold',
      // Additional theme info
      logoPosition: 'bottom-right',
      accentColor: '#005596',
      templateName: 'Bell Canada Template'
    }
  }

  // Internal Strategy - Dark modern style (Alien Minds)
  if (id === 'internal-strategy') {
    return {
      panelBg: 'bg-[#0B0F1A]',
      panelBorder: 'border-0',
      panelShadow: 'shadow-2xl ring-1 ring-[#1F2A44]',
      slideBackground: 'bg-gradient-to-br from-[#0B0F1A] via-[#111827] to-[#0B0F1A]',
      headerAccent: 'bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6]',
      titleText: 'text-white',
      titleSize: 'text-3xl md:text-[34px] font-bold',
      bulletDot: 'bg-[#60A5FA]',
      bodyText: 'text-base md:text-lg text-gray-300',
      chromeBg: 'bg-[#030712]',
      sidebarBg: 'bg-[#0B0F1A]',
      sidebarItem: 'bg-[#111827] border border-[#1F2A44] shadow-lg',
      sidebarActive: 'border-[#60A5FA] bg-[#1E293B] ring-2 ring-[#60A5FA]/30',
      aiPanelBg: 'bg-[#0B0F1A]',
      aiPanelHeaderBg: 'bg-gradient-to-r from-[#1E293B] to-[#0B0F1A]',
      footerText: 'text-[10px] text-gray-500 uppercase tracking-[0.2em] font-semibold',
      logoPosition: 'top-left',
      accentColor: '#60A5FA',
      templateName: 'Internal Strategy'
    }
  }

  // Quarterly Review - Clean professional style
  if (id === 'quarterly-review') {
    return {
      panelBg: 'bg-white',
      panelBorder: 'border-0',
      panelShadow: 'shadow-xl ring-1 ring-gray-200',
      slideBackground: 'bg-gradient-to-br from-white via-gray-50/50 to-slate-50',
      headerAccent: 'bg-gradient-to-r from-gray-800 to-gray-600',
      titleText: 'text-gray-900',
      titleSize: 'text-2xl md:text-[32px] font-semibold',
      bulletDot: 'bg-gray-800',
      bodyText: 'text-sm md:text-base text-gray-600',
      chromeBg: 'bg-gradient-to-b from-slate-50 to-gray-100',
      sidebarBg: 'bg-white',
      sidebarItem: 'bg-gray-50 border border-gray-200 shadow-sm',
      sidebarActive: 'border-gray-800 bg-white ring-2 ring-gray-300',
      aiPanelBg: 'bg-white',
      aiPanelHeaderBg: 'bg-gradient-to-r from-gray-50 to-white',
      footerText: 'text-[10px] text-gray-400 uppercase tracking-[0.2em] font-semibold',
      logoPosition: 'bottom-left',
      accentColor: '#1F2937',
      templateName: 'Quarterly Review'
    }
  }

  // Default fallback
  return {
    panelBg: 'bg-white dark:bg-surface-dark',
    panelBorder: 'border border-border-light dark:border-border-dark',
    panelShadow: 'shadow-lg',
    slideBackground: 'bg-white',
    headerAccent: 'bg-primary',
    titleText: 'text-primary dark:text-blue-400',
    titleSize: 'text-2xl md:text-3xl font-bold',
    bulletDot: 'bg-secondary',
    bodyText: 'text-sm md:text-base text-gray-700',
    chromeBg: 'bg-gray-100/50 dark:bg-black/20',
    sidebarBg: 'bg-white dark:bg-gray-800',
    sidebarItem: 'bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600',
    sidebarActive: 'border-primary bg-blue-50',
    aiPanelBg: 'bg-white dark:bg-surface-dark',
    aiPanelHeaderBg: 'bg-blue-50/50 dark:bg-blue-900/10',
    footerText: 'text-[9px] text-gray-400 uppercase tracking-widest font-semibold',
    logoPosition: 'bottom-right',
    accentColor: '#005596',
    templateName: 'Default Template'
  }
}

