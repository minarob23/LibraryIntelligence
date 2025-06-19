
const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

const isDev = !app.isPackaged;

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.cjs'),
      webSecurity: false
    },
    icon: path.join(__dirname, '../generated-icon.png'),
    titleBarStyle: 'default',
    show: false
  });

  // Load the app
  if (isDev) {
    const serverUrl = 'http://localhost:5173';

    console.log('🌐 Loading URL:', serverUrl);

    // Load immediately - wait-on ensures server is ready
    mainWindow.loadURL(serverUrl);

    // mainWindow.webContents.openDevTools();
  } else {
    // In production, load the built HTML file
    const htmlPath = path.join(__dirname, '../dist/index.html');
    console.log('📁 Loading file:', htmlPath);
    mainWindow.loadFile(htmlPath);
    
    // Enable dev tools in production for debugging
    mainWindow.webContents.openDevTools();
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('Failed to load:', validatedURL, errorDescription, 'Error code:', errorCode);

    // Retry loading after a delay
    setTimeout(() => {
      console.log('Retrying to load:', validatedURL);
      if (isDev) {
        mainWindow.loadURL(validatedURL);
      } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
      }
    }, 3000);
  });

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('✅ Page loaded successfully');
  });

  mainWindow.webContents.on('dom-ready', () => {
    console.log('📄 DOM is ready');
  });

  mainWindow.webContents.on('did-navigate', (event, url) => {
    console.log('🧭 Navigated to:', url);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Create menu
function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Quit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(() => {
  createWindow();
  createMenu();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
