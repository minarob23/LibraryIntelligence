
// Settings utility for accessing user preferences across all pages
export interface UserSettings {
  selectedLanguage: string;
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

// Translation dictionaries
export const translations = {
  en: {
    // Dashboard
    dashboard: 'Dashboard',
    overview: 'Overview of library statistics and activities',
    booksManagement: 'Books Management',
    browseBooks: 'Browse and manage the library\'s book collection',
    borrowersManagement: 'Borrowers Management',
    manageBorrowers: 'Browse and manage library borrowers',
    borrowingManagement: 'Borrowing Management',
    trackBorrowing: 'Track and manage book borrowings',
    librariansManagement: 'Librarians Management',
    manageLibrarians: 'Browse and manage library staff',
    
    // Common actions
    add: 'Add',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    search: 'Search',
    filter: 'Filter',
    export: 'Export',
    import: 'Import',
    refresh: 'Refresh',
    settings: 'Settings',
    
    // Status
    active: 'Active',
    inactive: 'Inactive',
    available: 'Available',
    borrowed: 'Borrowed',
    overdue: 'Overdue',
    returned: 'Returned',
    
    // Common labels
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    address: 'Address',
    category: 'Category',
    status: 'Status',
    date: 'Date',
    actions: 'Actions',
    
    // Books
    book: 'Book',
    books: 'Books',
    title: 'Title',
    author: 'Author',
    publisher: 'Publisher',
    isbn: 'ISBN',
    pages: 'Pages',
    genre: 'Genre',
    year: 'Year',
    
    // Borrowing
    borrowDate: 'Borrow Date',
    dueDate: 'Due Date',
    returnDate: 'Return Date',
    borrower: 'Borrower',
    
    // Messages
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    info: 'Information',
    loading: 'Loading...',
    noData: 'No data available',
    
    // Time
    today: 'Today',
    yesterday: 'Yesterday',
    tomorrow: 'Tomorrow',
    thisWeek: 'This Week',
    thisMonth: 'This Month',
    thisYear: 'This Year'
  },
  es: {
    // Dashboard
    dashboard: 'Panel de Control',
    overview: 'Resumen de estadísticas y actividades de la biblioteca',
    booksManagement: 'Gestión de Libros',
    browseBooks: 'Explorar y gestionar la colección de libros de la biblioteca',
    borrowersManagement: 'Gestión de Prestatarios',
    manageBorrowers: 'Explorar y gestionar prestatarios de la biblioteca',
    borrowingManagement: 'Gestión de Préstamos',
    trackBorrowing: 'Rastrear y gestionar préstamos de libros',
    librariansManagement: 'Gestión de Bibliotecarios',
    manageLibrarians: 'Explorar y gestionar personal de la biblioteca',
    
    // Common actions
    add: 'Agregar',
    edit: 'Editar',
    delete: 'Eliminar',
    save: 'Guardar',
    cancel: 'Cancelar',
    search: 'Buscar',
    filter: 'Filtrar',
    export: 'Exportar',
    import: 'Importar',
    refresh: 'Actualizar',
    settings: 'Configuraciones',
    
    // Status
    active: 'Activo',
    inactive: 'Inactivo',
    available: 'Disponible',
    borrowed: 'Prestado',
    overdue: 'Vencido',
    returned: 'Devuelto',
    
    // Common labels
    name: 'Nombre',
    email: 'Correo Electrónico',
    phone: 'Teléfono',
    address: 'Dirección',
    category: 'Categoría',
    status: 'Estado',
    date: 'Fecha',
    actions: 'Acciones',
    
    // Books
    book: 'Libro',
    books: 'Libros',
    title: 'Título',
    author: 'Autor',
    publisher: 'Editorial',
    isbn: 'ISBN',
    pages: 'Páginas',
    genre: 'Género',
    year: 'Año',
    
    // Borrowing
    borrowDate: 'Fecha de Préstamo',
    dueDate: 'Fecha de Vencimiento',
    returnDate: 'Fecha de Devolución',
    borrower: 'Prestatario',
    
    // Messages
    success: 'Éxito',
    error: 'Error',
    warning: 'Advertencia',
    info: 'Información',
    loading: 'Cargando...',
    noData: 'No hay datos disponibles',
    
    // Time
    today: 'Hoy',
    yesterday: 'Ayer',
    tomorrow: 'Mañana',
    thisWeek: 'Esta Semana',
    thisMonth: 'Este Mes',
    thisYear: 'Este Año'
  },
  fr: {
    // Dashboard
    dashboard: 'Tableau de Bord',
    overview: 'Aperçu des statistiques et activités de la bibliothèque',
    booksManagement: 'Gestion des Livres',
    browseBooks: 'Parcourir et gérer la collection de livres de la bibliothèque',
    borrowersManagement: 'Gestion des Emprunteurs',
    manageBorrowers: 'Parcourir et gérer les emprunteurs de la bibliothèque',
    borrowingManagement: 'Gestion des Emprunts',
    trackBorrowing: 'Suivre et gérer les emprunts de livres',
    librariansManagement: 'Gestion des Bibliothécaires',
    manageLibrarians: 'Parcourir et gérer le personnel de la bibliothèque',
    
    // Common actions
    add: 'Ajouter',
    edit: 'Modifier',
    delete: 'Supprimer',
    save: 'Enregistrer',
    cancel: 'Annuler',
    search: 'Rechercher',
    filter: 'Filtrer',
    export: 'Exporter',
    import: 'Importer',
    refresh: 'Actualiser',
    settings: 'Paramètres',
    
    // Status
    active: 'Actif',
    inactive: 'Inactif',
    available: 'Disponible',
    borrowed: 'Emprunté',
    overdue: 'En Retard',
    returned: 'Retourné',
    
    // Common labels
    name: 'Nom',
    email: 'E-mail',
    phone: 'Téléphone',
    address: 'Adresse',
    category: 'Catégorie',
    status: 'Statut',
    date: 'Date',
    actions: 'Actions',
    
    // Books
    book: 'Livre',
    books: 'Livres',
    title: 'Titre',
    author: 'Auteur',
    publisher: 'Éditeur',
    isbn: 'ISBN',
    pages: 'Pages',
    genre: 'Genre',
    year: 'Année',
    
    // Borrowing
    borrowDate: 'Date d\'Emprunt',
    dueDate: 'Date d\'Échéance',
    returnDate: 'Date de Retour',
    borrower: 'Emprunteur',
    
    // Messages
    success: 'Succès',
    error: 'Erreur',
    warning: 'Avertissement',
    info: 'Information',
    loading: 'Chargement...',
    noData: 'Aucune donnée disponible',
    
    // Time
    today: 'Aujourd\'hui',
    yesterday: 'Hier',
    tomorrow: 'Demain',
    thisWeek: 'Cette Semaine',
    thisMonth: 'Ce Mois',
    thisYear: 'Cette Année'
  },
  ar: {
    // Dashboard
    dashboard: 'لوحة التحكم',
    overview: 'نظرة عامة على إحصائيات وأنشطة المكتبة',
    booksManagement: 'إدارة الكتب',
    browseBooks: 'تصفح وإدارة مجموعة كتب المكتبة',
    borrowersManagement: 'إدارة المستعيرين',
    manageBorrowers: 'تصفح وإدارة مستعيري المكتبة',
    borrowingManagement: 'إدارة الاستعارة',
    trackBorrowing: 'تتبع وإدارة استعارة الكتب',
    librariansManagement: 'إدارة أمناء المكتبة',
    manageLibrarians: 'تصفح وإدارة موظفي المكتبة',
    
    // Common actions
    add: 'إضافة',
    edit: 'تحرير',
    delete: 'حذف',
    save: 'حفظ',
    cancel: 'إلغاء',
    search: 'بحث',
    filter: 'تصفية',
    export: 'تصدير',
    import: 'استيراد',
    refresh: 'تحديث',
    settings: 'الإعدادات',
    
    // Status
    active: 'نشط',
    inactive: 'غير نشط',
    available: 'متاح',
    borrowed: 'مستعار',
    overdue: 'متأخر',
    returned: 'مُرجع',
    
    // Common labels
    name: 'الاسم',
    email: 'البريد الإلكتروني',
    phone: 'الهاتف',
    address: 'العنوان',
    category: 'الفئة',
    status: 'الحالة',
    date: 'التاريخ',
    actions: 'الإجراءات',
    
    // Books
    book: 'كتاب',
    books: 'الكتب',
    title: 'العنوان',
    author: 'المؤلف',
    publisher: 'الناشر',
    isbn: 'الرقم المعياري',
    pages: 'الصفحات',
    genre: 'النوع',
    year: 'السنة',
    
    // Borrowing
    borrowDate: 'تاريخ الاستعارة',
    dueDate: 'تاريخ الاستحقاق',
    returnDate: 'تاريخ الإرجاع',
    borrower: 'المستعير',
    
    // Messages
    success: 'نجح',
    error: 'خطأ',
    warning: 'تحذير',
    info: 'معلومات',
    loading: 'جاري التحميل...',
    noData: 'لا توجد بيانات متاحة',
    
    // Time
    today: 'اليوم',
    yesterday: 'أمس',
    tomorrow: 'غداً',
    thisWeek: 'هذا الأسبوع',
    thisMonth: 'هذا الشهر',
    thisYear: 'هذا العام'
  },
  de: {
    // Dashboard
    dashboard: 'Dashboard',
    overview: 'Überblick über Bibliotheksstatistiken und -aktivitäten',
    booksManagement: 'Buchverwaltung',
    browseBooks: 'Durchsuchen und Verwalten der Bibliotheksbuchsammlung',
    borrowersManagement: 'Entleiherverwaltung',
    manageBorrowers: 'Durchsuchen und Verwalten von Bibliotheksentleihern',
    borrowingManagement: 'Ausleihverwaltung',
    trackBorrowing: 'Buchausleihen verfolgen und verwalten',
    librariansManagement: 'Bibliothekarverwaltung',
    manageLibrarians: 'Durchsuchen und Verwalten des Bibliothekspersonals',
    
    // Common actions
    add: 'Hinzufügen',
    edit: 'Bearbeiten',
    delete: 'Löschen',
    save: 'Speichern',
    cancel: 'Abbrechen',
    search: 'Suchen',
    filter: 'Filtern',
    export: 'Exportieren',
    import: 'Importieren',
    refresh: 'Aktualisieren',
    settings: 'Einstellungen',
    
    // Status
    active: 'Aktiv',
    inactive: 'Inaktiv',
    available: 'Verfügbar',
    borrowed: 'Ausgeliehen',
    overdue: 'Überfällig',
    returned: 'Zurückgegeben',
    
    // Common labels
    name: 'Name',
    email: 'E-Mail',
    phone: 'Telefon',
    address: 'Adresse',
    category: 'Kategorie',
    status: 'Status',
    date: 'Datum',
    actions: 'Aktionen',
    
    // Books
    book: 'Buch',
    books: 'Bücher',
    title: 'Titel',
    author: 'Autor',
    publisher: 'Verlag',
    isbn: 'ISBN',
    pages: 'Seiten',
    genre: 'Genre',
    year: 'Jahr',
    
    // Borrowing
    borrowDate: 'Ausleihdatum',
    dueDate: 'Fälligkeitsdatum',
    returnDate: 'Rückgabedatum',
    borrower: 'Entleiher',
    
    // Messages
    success: 'Erfolg',
    error: 'Fehler',
    warning: 'Warnung',
    info: 'Information',
    loading: 'Lädt...',
    noData: 'Keine Daten verfügbar',
    
    // Time
    today: 'Heute',
    yesterday: 'Gestern',
    tomorrow: 'Morgen',
    thisWeek: 'Diese Woche',
    thisMonth: 'Dieser Monat',
    thisYear: 'Dieses Jahr'
  }
};

// Get user settings from localStorage with defaults
export const getUserSettings = (): UserSettings => {
  return {
    selectedLanguage: localStorage.getItem('selectedLanguage') || 'en',
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

// Get translation function
export const useTranslation = () => {
  const settings = getUserSettings();
  const t = translations[settings.selectedLanguage as keyof typeof translations] || translations.en;
  return { t, language: settings.selectedLanguage };
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
  
  // Apply language direction
  if (settings.selectedLanguage === 'ar') {
    document.documentElement.setAttribute('dir', 'rtl');
    document.documentElement.setAttribute('lang', 'ar');
  } else {
    document.documentElement.setAttribute('dir', 'ltr');
    document.documentElement.setAttribute('lang', settings.selectedLanguage);
  }
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
