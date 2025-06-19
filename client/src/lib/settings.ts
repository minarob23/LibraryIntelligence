// Settings utility for accessing user preferences across all pages
export interface UserSettings {
  refreshInterval: number;
  tableRowsPerPage: number;
  showBookCovers: boolean;
  enableSounds: boolean;
  doubleClickEdit: boolean;
  confirmDelete: boolean;
  backupFrequency: string;
  isDarkMode: boolean;
  isCompactView: boolean;
  emailNotifications: boolean;
  autoBackup: boolean;
  fontSizePreference: string;
}

// Get user settings from localStorage with defaults
export const getUserSettings = (): UserSettings => {
  return {
    refreshInterval: parseInt(localStorage.getItem('refreshInterval') || '2'),
    tableRowsPerPage: parseInt(localStorage.getItem('tableRowsPerPage') || '10'),
    showBookCovers: localStorage.getItem('showBookCovers') !== 'false',
    enableSounds: localStorage.getItem('enableSounds') !== 'false',
    doubleClickEdit: localStorage.getItem('doubleClickEdit') !== 'false',
    confirmDelete: localStorage.getItem('confirmDelete') !== 'false',
    backupFrequency: localStorage.getItem('backupFrequency') || 'daily',
    isDarkMode: localStorage.getItem('theme') === 'dark',
    isCompactView: localStorage.getItem('isCompactView') === 'true',
    emailNotifications: localStorage.getItem('emailNotifications') !== 'false',
    autoBackup: localStorage.getItem('autoBackup') !== 'false',
    fontSizePreference: localStorage.getItem('fontSizePreference') || 'medium'
  };
};

// Save user setting
export const saveSetting = (key: keyof UserSettings, value: any) => {
  localStorage.setItem(key, value.toString());
};

// Apply user settings to the DOM
export const applyUserSettings = () => {
  const settings = getUserSettings();

  // Apply theme
  if (settings.isDarkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  // Apply font size
  document.documentElement.classList.remove('text-sm', 'text-base', 'text-lg');
  switch (settings.fontSizePreference) {
    case 'small':
      document.documentElement.classList.add('text-sm');
      break;
    case 'medium':
      document.documentElement.classList.add('text-base');
      break;
    case 'large':
      document.documentElement.classList.add('text-lg');
      break;
  }

  // Apply language direction (always left-to-right since no language preferences)
  document.documentElement.setAttribute('dir', 'ltr');
  document.documentElement.setAttribute('lang', 'en');
};

// Play sound effect if enabled
export const playSound = (soundType: 'success' | 'error' | 'warning' | 'click') => {
  const settings = getUserSettings();
  if (!settings.enableSounds) return;

  // Simple audio context for basic sounds
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  // Different frequencies for different sound types
  switch (soundType) {
    case 'success':
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      break;
    case 'error':
      oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
      break;
    case 'warning':
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
      break;
    case 'click':
      oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
      break;
  }

  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.1);
};