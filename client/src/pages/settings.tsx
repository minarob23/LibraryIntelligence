
import { useState, useEffect } from 'react';
import { useCompactView } from '@/lib/context/compact-view-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { Upload, Download, FileText, FileSpreadsheet, Clock, Type, Globe, Palette, Database, Shield, Bell } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Slider } from '@/components/ui/slider';

// Translation dictionaries
const translations = {
  en: {
    settings: 'Settings',
    configureSystem: 'Configure system preferences and data management',
    profileSettings: 'Profile Settings',
    libraryHours: 'Library Hours',
    security: 'Security',
    systemPreferences: 'System Preferences',
    dataManagement: 'Data Management',
    appearance: 'Appearance',
    notifications: 'Notifications',
    language: 'Language',
    displayLanguage: 'Display Language',
    darkMode: 'Dark Mode',
    compactView: 'Compact View',
    emailNotifications: 'Email Notifications',
    autoRefresh: 'Auto-refresh Data',
    textSize: 'Text Size',
    small: 'Small',
    medium: 'Medium',
    large: 'Large',
    savePreferences: 'Save Preferences',
    preferencesUpdated: 'Preferences Updated',
    languageChanged: 'Language changed to',
    english: 'English',
    spanish: 'Spanish',
    french: 'French',
    arabic: 'Arabic',
    german: 'German',
    updatePassword: 'Update Password',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    confirmNewPassword: 'Confirm New Password',
    passwordUpdated: 'Password Updated',
    autoBackup: 'Auto Backup',
    backupFrequency: 'Backup Frequency',
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    exportData: 'Export Data',
    importData: 'Import Data',
    resetDatabase: 'Reset Database',
    refreshInterval: 'Data Refresh Interval',
    tableRowsPerPage: 'Table Rows Per Page',
    showBookCovers: 'Show Book Covers',
    enableSounds: 'Enable Sound Effects',
    doubleClickEdit: 'Double Click to Edit',
    confirmDelete: 'Confirm Before Delete',
    systemSettings: 'System Settings',
    displaySettings: 'Display Settings',
    behaviorSettings: 'Behavior Settings',
    seconds: 'seconds',
    rows: 'rows'
  },
  es: {
    settings: 'Configuraciones',
    configureSystem: 'Configurar preferencias del sistema y gestión de datos',
    profileSettings: 'Configuraciones de Perfil',
    libraryHours: 'Horarios de la Biblioteca',
    security: 'Seguridad',
    systemPreferences: 'Preferencias del Sistema',
    dataManagement: 'Gestión de Datos',
    appearance: 'Apariencia',
    notifications: 'Notificaciones',
    language: 'Idioma',
    displayLanguage: 'Idioma de Visualización',
    darkMode: 'Modo Oscuro',
    compactView: 'Vista Compacta',
    emailNotifications: 'Notificaciones por Email',
    autoRefresh: 'Actualización Automática de Datos',
    textSize: 'Tamaño de Texto',
    small: 'Pequeño',
    medium: 'Mediano',
    large: 'Grande',
    savePreferences: 'Guardar Preferencias',
    preferencesUpdated: 'Preferencias Actualizadas',
    languageChanged: 'Idioma cambiado a',
    english: 'Inglés',
    spanish: 'Español',
    french: 'Francés',
    arabic: 'Árabe',
    german: 'Alemán',
    updatePassword: 'Actualizar Contraseña',
    currentPassword: 'Contraseña Actual',
    newPassword: 'Nueva Contraseña',
    confirmNewPassword: 'Confirmar Nueva Contraseña',
    passwordUpdated: 'Contraseña Actualizada',
    autoBackup: 'Copia de Seguridad Automática',
    backupFrequency: 'Frecuencia de Copia de Seguridad',
    daily: 'Diario',
    weekly: 'Semanal',
    monthly: 'Mensual',
    exportData: 'Exportar Datos',
    importData: 'Importar Datos',
    resetDatabase: 'Reiniciar Base de Datos',
    refreshInterval: 'Intervalo de Actualización de Datos',
    tableRowsPerPage: 'Filas de Tabla por Página',
    showBookCovers: 'Mostrar Portadas de Libros',
    enableSounds: 'Habilitar Efectos de Sonido',
    doubleClickEdit: 'Doble Clic para Editar',
    confirmDelete: 'Confirmar Antes de Eliminar',
    systemSettings: 'Configuraciones del Sistema',
    displaySettings: 'Configuraciones de Visualización',
    behaviorSettings: 'Configuraciones de Comportamiento',
    seconds: 'segundos',
    rows: 'filas'
  },
  fr: {
    settings: 'Paramètres',
    configureSystem: 'Configurer les préférences système et la gestion des données',
    profileSettings: 'Paramètres de Profil',
    libraryHours: 'Heures de la Bibliothèque',
    security: 'Sécurité',
    systemPreferences: 'Préférences Système',
    dataManagement: 'Gestion des Données',
    appearance: 'Apparence',
    notifications: 'Notifications',
    language: 'Langue',
    displayLanguage: 'Langue d\'Affichage',
    darkMode: 'Mode Sombre',
    compactView: 'Vue Compacte',
    emailNotifications: 'Notifications Email',
    autoRefresh: 'Actualisation Automatique des Données',
    textSize: 'Taille du Texte',
    small: 'Petit',
    medium: 'Moyen',
    large: 'Grand',
    savePreferences: 'Sauvegarder les Préférences',
    preferencesUpdated: 'Préférences Mises à Jour',
    languageChanged: 'Langue changée vers',
    english: 'Anglais',
    spanish: 'Espagnol',
    french: 'Français',
    arabic: 'Arabe',
    german: 'Allemand',
    updatePassword: 'Mettre à Jour le Mot de Passe',
    currentPassword: 'Mot de Passe Actuel',
    newPassword: 'Nouveau Mot de Passe',
    confirmNewPassword: 'Confirmer le Nouveau Mot de Passe',
    passwordUpdated: 'Mot de Passe Mis à Jour',
    autoBackup: 'Sauvegarde Automatique',
    backupFrequency: 'Fréquence de Sauvegarde',
    daily: 'Quotidien',
    weekly: 'Hebdomadaire',
    monthly: 'Mensuel',
    exportData: 'Exporter les Données',
    importData: 'Importer les Données',
    resetDatabase: 'Réinitialiser la Base de Données',
    refreshInterval: 'Intervalle d\'Actualisation des Données',
    tableRowsPerPage: 'Lignes de Tableau par Page',
    showBookCovers: 'Afficher les Couvertures de Livres',
    enableSounds: 'Activer les Effets Sonores',
    doubleClickEdit: 'Double-Clic pour Modifier',
    confirmDelete: 'Confirmer Avant Suppression',
    systemSettings: 'Paramètres Système',
    displaySettings: 'Paramètres d\'Affichage',
    behaviorSettings: 'Paramètres de Comportement',
    seconds: 'secondes',
    rows: 'lignes'
  },
  ar: {
    settings: 'الإعدادات',
    configureSystem: 'تكوين تفضيلات النظام وإدارة البيانات',
    profileSettings: 'إعدادات الملف الشخصي',
    libraryHours: 'ساعات المكتبة',
    security: 'الأمان',
    systemPreferences: 'تفضيلات النظام',
    dataManagement: 'إدارة البيانات',
    appearance: 'المظهر',
    notifications: 'الإشعارات',
    language: 'اللغة',
    displayLanguage: 'لغة العرض',
    darkMode: 'الوضع المظلم',
    compactView: 'العرض المضغوط',
    emailNotifications: 'إشعارات البريد الإلكتروني',
    autoRefresh: 'تحديث البيانات تلقائياً',
    textSize: 'حجم النص',
    small: 'صغير',
    medium: 'متوسط',
    large: 'كبير',
    savePreferences: 'حفظ التفضيلات',
    preferencesUpdated: 'تم تحديث التفضيلات',
    languageChanged: 'تم تغيير اللغة إلى',
    english: 'الإنجليزية',
    spanish: 'الإسبانية',
    french: 'الفرنسية',
    arabic: 'العربية',
    german: 'الألمانية',
    updatePassword: 'تحديث كلمة المرور',
    currentPassword: 'كلمة المرور الحالية',
    newPassword: 'كلمة المرور الجديدة',
    confirmNewPassword: 'تأكيد كلمة المرور الجديدة',
    passwordUpdated: 'تم تحديث كلمة المرور',
    autoBackup: 'النسخ الاحتياطي التلقائي',
    backupFrequency: 'تكرار النسخ الاحتياطي',
    daily: 'يومي',
    weekly: 'أسبوعي',
    monthly: 'شهري',
    exportData: 'تصدير البيانات',
    importData: 'استيراد البيانات',
    resetDatabase: 'إعادة تعيين قاعدة البيانات',
    refreshInterval: 'فترة تحديث البيانات',
    tableRowsPerPage: 'صفوف الجدول لكل صفحة',
    showBookCovers: 'إظهار أغلفة الكتب',
    enableSounds: 'تفعيل التأثيرات الصوتية',
    doubleClickEdit: 'نقرة مزدوجة للتحرير',
    confirmDelete: 'تأكيد قبل الحذف',
    systemSettings: 'إعدادات النظام',
    displaySettings: 'إعدادات العرض',
    behaviorSettings: 'إعدادات السلوك',
    seconds: 'ثواني',
    rows: 'صفوف'
  },
  de: {
    settings: 'Einstellungen',
    configureSystem: 'Systemeinstellungen und Datenmanagement konfigurieren',
    profileSettings: 'Profil-Einstellungen',
    libraryHours: 'Bibliothekszeiten',
    security: 'Sicherheit',
    systemPreferences: 'System-Präferenzen',
    dataManagement: 'Datenmanagement',
    appearance: 'Aussehen',
    notifications: 'Benachrichtigungen',
    language: 'Sprache',
    displayLanguage: 'Anzeigesprache',
    darkMode: 'Dunkler Modus',
    compactView: 'Kompakte Ansicht',
    emailNotifications: 'E-Mail-Benachrichtigungen',
    autoRefresh: 'Automatische Datenaktualisierung',
    textSize: 'Textgröße',
    small: 'Klein',
    medium: 'Mittel',
    large: 'Groß',
    savePreferences: 'Einstellungen Speichern',
    preferencesUpdated: 'Einstellungen Aktualisiert',
    languageChanged: 'Sprache geändert zu',
    english: 'Englisch',
    spanish: 'Spanisch',
    french: 'Französisch',
    arabic: 'Arabisch',
    german: 'Deutsch',
    updatePassword: 'Passwort Aktualisieren',
    currentPassword: 'Aktuelles Passwort',
    newPassword: 'Neues Passwort',
    confirmNewPassword: 'Neues Passwort Bestätigen',
    passwordUpdated: 'Passwort Aktualisiert',
    autoBackup: 'Automatische Sicherung',
    backupFrequency: 'Sicherungshäufigkeit',
    daily: 'Täglich',
    weekly: 'Wöchentlich',
    monthly: 'Monatlich',
    exportData: 'Daten Exportieren',
    importData: 'Daten Importieren',
    resetDatabase: 'Datenbank Zurücksetzen',
    refreshInterval: 'Datenaktualisierungsintervall',
    tableRowsPerPage: 'Tabellenzeilen pro Seite',
    showBookCovers: 'Buchcover Anzeigen',
    enableSounds: 'Soundeffekte Aktivieren',
    doubleClickEdit: 'Doppelklick zum Bearbeiten',
    confirmDelete: 'Vor Löschen Bestätigen',
    systemSettings: 'Systemeinstellungen',
    displaySettings: 'Anzeigeeinstellungen',
    behaviorSettings: 'Verhaltenseinstellungen',
    seconds: 'Sekunden',
    rows: 'Zeilen'
  }
};

const Settings = () => {
  const { toast } = useToast();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));
  const { isCompactView, setIsCompactView } = useCompactView();
  const [fontSizePreference, setFontSizePreference] = useState('medium');
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    return localStorage.getItem('selectedLanguage') || 'en';
  });
  
  const [showBookCovers, setShowBookCovers] = useState(() => {
    return localStorage.getItem('showBookCovers') !== 'false';
  });

  const [libraryHours, setLibraryHours] = useState({
    monday: { open: '09:00', close: '18:00' },
    tuesday: { open: '09:00', close: '18:00' },
    wednesday: { open: '09:00', close: '18:00' },
    thursday: { open: '09:00', close: '18:00' },
    friday: { open: '09:00', close: '18:00' },
    saturday: { open: '10:00', close: '16:00' },
    sunday: { open: 'Closed', close: 'Closed' },
  });

  // Get current translation
  const t = translations[selectedLanguage as keyof typeof translations] || translations.en;

  // Fetch data for export
  const { data: books } = useQuery({ queryKey: ['/api/books'] });
  const { data: borrowers } = useQuery({ queryKey: ['/api/borrowers'] });
  const { data: librarians } = useQuery({ queryKey: ['/api/librarians'] });
  const { data: borrowings } = useQuery({ queryKey: ['/api/borrowings'] });
  const { data: feedback } = useQuery({ queryKey: ['/api/feedback'] });
  const { data: research } = useQuery({ queryKey: ['/api/research'] });

  // Initialize language settings on component mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('selectedLanguage') || 'en';
    setSelectedLanguage(savedLanguage);
    
    // Apply language direction and attributes
    if (savedLanguage === 'ar') {
      document.documentElement.setAttribute('dir', 'rtl');
      document.documentElement.setAttribute('lang', 'ar');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
      document.documentElement.setAttribute('lang', savedLanguage);
    }
  }, []);

  const handleSavePreferences = () => {
    // Apply font size setting to document
    document.documentElement.classList.remove('text-sm', 'text-base', 'text-lg');
    switch (fontSizePreference) {
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

    // Save all settings to localStorage
    localStorage.setItem('libraryHours', JSON.stringify(libraryHours));
    localStorage.setItem('selectedLanguage', selectedLanguage);
    localStorage.setItem('showBookCovers', showBookCovers.toString());
    localStorage.setItem('fontSizePreference', fontSizePreference);

    toast({
      title: t.preferencesUpdated,
      description: "Your settings have been updated."
    });
  };

  const handleLibraryHoursChange = (day: string, type: 'open' | 'close', value: string) => {
    setLibraryHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day as keyof typeof prev],
        [type]: value
      }
    }));
  };

  const getLanguageDisplayName = (langCode: string) => {
    const names = {
      'en': t.english,
      'es': t.spanish,
      'fr': t.french,
      'ar': t.arabic,
      'de': t.german
    };
    return names[langCode as keyof typeof names] || langCode;
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6 animate-slide-up">
        <h2 className="text-2xl font-bold">{t.settings}</h2>
        <p className="text-gray-600 dark:text-gray-400">{t.configureSystem}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              {t.profileSettings}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col items-center space-y-3">
                <div className="relative w-24 h-24">
                  <img
                    src={profileImage || 'https://github.com/shadcn.png'}
                    alt="Profile"
                    className="rounded-full w-full h-full object-cover"
                  />
                  <label
                    htmlFor="profile-upload"
                    className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-1 rounded-full cursor-pointer hover:bg-primary/90"
                  >
                    <Upload className="h-4 w-4" />
                  </label>
                  <input
                    id="profile-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          setProfileImage(e.target?.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>
                <Button variant="outline" size="sm" onClick={() => setProfileImage(null)}>
                  Remove Photo
                </Button>
              </div>
              <div className="space-y-2">
                <Label htmlFor="display-name">Display Name</Label>
                <Input id="display-name" placeholder="Your name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="your@email.com" />
              </div>
              <Button onClick={() => {
                toast({ title: "Profile updated" });
              }}>
                Save Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Library Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-500" />
              {t.libraryHours}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(libraryHours).map(([day, hours]) => (
                <div key={day} className="flex justify-between text-sm">
                  <span className="font-medium capitalize">{day}</span>
                  <span>{hours.open === 'Closed' ? 'Closed' : `${hours.open} - ${hours.close}`}</span>
                </div>
              ))}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="mt-4 w-full">Edit Hours</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Edit Library Hours</DialogTitle>
                    <DialogDescription>
                      Set the opening and closing hours for each day of the week.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    {Object.entries(libraryHours).map(([day, hours]) => (
                      <div key={day} className="grid grid-cols-[1fr,2fr,2fr,auto] gap-4 items-center">
                        <div className="font-medium capitalize">{day}</div>
                        <div>
                          <Label htmlFor={`${day}-open`} className="text-xs mb-1 block">Opening Time</Label>
                          <Input
                            id={`${day}-open`}
                            type="time"
                            value={hours.open !== 'Closed' ? hours.open : ''}
                            disabled={hours.open === 'Closed'}
                            onChange={(e) => handleLibraryHoursChange(day, 'open', e.target.value || 'Closed')}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`${day}-close`} className="text-xs mb-1 block">Closing Time</Label>
                          <Input
                            id={`${day}-close`}
                            type="time"
                            value={hours.close !== 'Closed' ? hours.close : ''}
                            disabled={hours.close === 'Closed'}
                            onChange={(e) => handleLibraryHoursChange(day, 'close', e.target.value || 'Closed')}
                          />
                        </div>
                        <div className="flex items-end">
                          <Button
                            variant={hours.open === 'Closed' ? "destructive" : "outline"}
                            size="sm"
                            className="mb-[2px]"
                            onClick={() => {
                              if (hours.open === 'Closed') {
                                handleLibraryHoursChange(day, 'open', '09:00');
                                handleLibraryHoursChange(day, 'close', '17:00');
                              } else {
                                handleLibraryHoursChange(day, 'open', 'Closed');
                                handleLibraryHoursChange(day, 'close', 'Closed');
                              }
                            }}
                          >
                            {hours.open === 'Closed' ? 'Open Day' : 'Close Day'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <DialogFooter>
                    <Button onClick={handleSavePreferences}>
                      Save Changes
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-500" />
              {t.security}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <h4 className="text-md font-medium">{t.updatePassword}</h4>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">{t.currentPassword}</Label>
                  <Input id="currentPassword" type="password" placeholder="Enter current password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">{t.newPassword}</Label>
                  <Input id="newPassword" type="password" placeholder="Enter new password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t.confirmNewPassword}</Label>
                  <Input id="confirmPassword" type="password" placeholder="Confirm new password" />
                </div>
              </div>
              <Button onClick={() => {
                const currentPassword = (document.getElementById('currentPassword') as HTMLInputElement)?.value;
                const newPassword = (document.getElementById('newPassword') as HTMLInputElement)?.value;
                const confirmPassword = (document.getElementById('confirmPassword') as HTMLInputElement)?.value;

                if (currentPassword && (!newPassword || !confirmPassword)) {
                  toast({
                    title: "Validation Error",
                    description: "Please fill in all password fields to update password",
                    variant: "destructive"
                  });
                  return;
                }

                if (newPassword && newPassword !== confirmPassword) {
                  toast({
                    title: "Password Mismatch",
                    description: "New password and confirmation do not match",
                    variant: "destructive"
                  });
                  return;
                }

                if (!currentPassword || !newPassword || !confirmPassword) {
                  toast({
                    title: "Validation Error",
                    description: "Please fill in all password fields",
                    variant: "destructive"
                  });
                  return;
                }

                toast({ 
                  title: t.passwordUpdated,
                  description: "Your password has been updated successfully"
                });
              }}>
                {t.updatePassword}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* System Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-purple-500" />
              {t.systemPreferences}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="text-md font-medium mb-3">{t.appearance}</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm">{t.darkMode}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Toggle between light and dark themes</p>
                    </div>
                    <Switch
                      checked={isDarkMode}
                      onCheckedChange={(checked) => {
                        setIsDarkMode(checked);
                        if (checked) {
                          document.documentElement.classList.add('dark');
                        } else {
                          document.documentElement.classList.remove('dark');
                        }
                        localStorage.setItem('theme', checked ? 'dark' : 'light');
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm">{t.compactView}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Reduce padding in tables and lists</p>
                    </div>
                    <Switch
                      checked={isCompactView}
                      onCheckedChange={(checked) => {
                        setIsCompactView(checked);
                        localStorage.setItem('isCompactView', checked.toString());
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm">{t.showBookCovers}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Display book cover images</p>
                    </div>
                    <Switch
                      checked={showBookCovers}
                      onCheckedChange={setShowBookCovers}
                    />
                  </div>
                </div>
              </div>

              

              {/* Text Size Settings */}
              <div className="mt-6">
                <h4 className="text-md font-medium mb-3">{t.textSize}</h4>
                <div className="flex items-center space-x-4">
                  <Type className="h-5 w-5 text-gray-500" />
                  <div className="flex-1">
                    <Select 
                      value={fontSizePreference} 
                      onValueChange={setFontSizePreference}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select text size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">{t.small}</SelectItem>
                        <SelectItem value="medium">{t.medium}</SelectItem>
                        <SelectItem value="large">{t.large}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Language Settings */}
              <div className="mt-6">
                <h4 className="text-md font-medium mb-3 flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-500" />
                  {t.language}
                </h4>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="language" className="text-sm">{t.displayLanguage}</Label>
                    <Select 
                      value={selectedLanguage}
                      onValueChange={(value) => {
                        setSelectedLanguage(value);
                        localStorage.setItem('selectedLanguage', value);
                        // Apply language direction for Arabic
                        if (value === 'ar') {
                          document.documentElement.setAttribute('dir', 'rtl');
                          document.documentElement.setAttribute('lang', 'ar');
                        } else {
                          document.documentElement.setAttribute('dir', 'ltr');
                          document.documentElement.setAttribute('lang', value);
                        }
                        toast({
                          title: t.preferencesUpdated,
                          description: `${t.languageChanged} ${getLanguageDisplayName(value)}`
                        });
                      }}
                    >
                      <SelectTrigger id="language" className="mt-1">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="ar">العربية</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <Button onClick={handleSavePreferences} className="w-full">
                  {t.savePreferences}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        
      </div>
    </div>
  );
};

export default Settings;
