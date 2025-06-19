import { app, BrowserWindow, Menu } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false
    },
    icon: path.join(__dirname, '../generated-icon.png'),
    titleBarStyle: 'default',
    show: false
  });

  // Load the app
  if (isDev) {
    // In development, load from Vite dev server
    const serverUrl = 'http://localhost:5173';
    console.log('🌐 Loading from dev server:', serverUrl);

    mainWindow.loadURL(serverUrl).catch((error) => {
      console.error('Failed to load from dev server:', error);
      console.log('Make sure Vite dev server is running on http://localhost:5173');

      // Show error message to user
      const errorHtml = `
        <html>
          <head><title>Development Server Required</title></head>
          <body style="font-family: Arial; padding: 40px; text-align: center;">
            <h1>Development Server Not Running</h1>
            <p>Please start the Vite development server first:</p>
            <code style="background: #f0f0f0; padding: 10px; display: block; margin: 20px 0;">npm run dev</code>
            <p>Then restart the Electron app.</p>
          </body>
        </html>
      `;

      mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(errorHtml)}`);
    });
  } else {
    // In production, load the built HTML file - this is a static app, no backend needed
    let htmlPath;

    if (app.isPackaged) {
      // When the app is packaged, files are in the app resources
      htmlPath = path.join(process.resourcesPath, 'dist', 'index.html');
    } else {
      // When running from the built files but not packaged
      htmlPath = path.join(__dirname, '../dist/index.html');
    }

    console.log('📁 Loading static app from file:', htmlPath);
    console.log('📁 App is packaged:', app.isPackaged);

    // Check if file exists before trying to load
    if (fs.existsSync(htmlPath)) {
      mainWindow.loadFile(htmlPath).catch((error) => {
        console.error('Failed to load HTML file:', error);
        tryFallbackPaths();
      });
    } else {
      console.log('📁 HTML file not found at primary path, trying fallbacks');
      tryFallbackPaths();
    }

    function tryFallbackPaths() {
      const fallbackPaths = [
        path.join(__dirname, '../dist/index.html'),
        path.join(process.resourcesPath, 'dist', 'index.html'),
        path.join(process.resourcesPath, 'app', 'dist', 'index.html'),
        path.join(process.cwd(), 'dist', 'index.html')
      ];

      let fallbackPromise = Promise.reject(new Error('No primary path'));

      fallbackPaths.forEach((fallbackPath) => {
        fallbackPromise = fallbackPromise.catch(() => {
          console.log('📁 Trying fallback path:', fallbackPath);
          if (fs.existsSync(fallbackPath)) {
            return mainWindow.loadFile(fallbackPath);
          } else {
            throw new Error(`File not found: ${fallbackPath}`);
          }
        });
      });

      fallbackPromise.catch((error) => {
        console.error('All file loading attempts failed:', error);
        // Show error page
        const errorHtml = `
          <html>
            <head><title>Error Loading App</title></head>
            <body style="font-family: Arial; padding: 40px; text-align: center;">
              <h1>Error Loading Application</h1>
              <p>Unable to find the application files.</p>
              <p>Please ensure the build was successful with: npm run build</p>
              <details>
                <summary>Technical Details</summary>
                <pre>${JSON.stringify({ htmlPath, fallbackPaths, error: error.message }, null, 2)}</pre>
              </details>
            </body>
          </html>
        `;
        mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(errorHtml)}`);
      });
    }
  }

  // mainWindow.webContents.openDevTools();

  // Handle navigation
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);

    if (isDev) {
      // In development, allow navigation to localhost dev server
      if (parsedUrl.hostname === 'localhost' && parsedUrl.port === '5173') {
        console.log('Allowing navigation to dev server:', navigationUrl);
        return;
      }
    } else {
      // In production, prevent navigation for file:// URLs to allow React Router to handle routing
      if (parsedUrl.protocol === 'file:') {
        event.preventDefault();
        console.log('Prevented navigation to:', navigationUrl, '- letting React Router handle it');
        return;
      }
    }

    // Prevent other external navigation
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'file:') {
      event.preventDefault();
      console.log('Prevented navigation to:', navigationUrl);
    }
  });

  // Handle new window requests to prevent external navigation
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    return { action: 'deny' };
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle failed loads
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL, isMainFrame) => {
    console.log('Load failed:', { errorCode, errorDescription, validatedURL, isMainFrame });

    if (isMainFrame && errorCode !== -3) { // Not ERR_ABORTED
      if (isDev) {
        // In development, retry loading from dev server after a delay
        setTimeout(() => {
          console.log('Retrying to load from dev server:', validatedURL);
          mainWindow.loadURL('http://localhost:5173');
        }, 3000);
      } else if (errorCode === -6) { // FILE_NOT_FOUND in production
        // For production, load index.html for client-side routing
        let htmlPath;
        if (app.isPackaged) {
          htmlPath = path.join(process.resourcesPath, 'dist', 'index.html');
        } else {
          htmlPath = path.join(__dirname, '../dist/index.html');
        }
        console.log('Loading index.html for client-side routing from:', htmlPath);
        mainWindow.loadFile(htmlPath);
      }
    }
  });

  // Handle certificate errors for production builds
  mainWindow.webContents.on('certificate-error', (event, url, error, certificate, callback) => {
    if (!isDev) {
      // In production, allow self-signed certificates
      event.preventDefault();
      callback(true);
    }
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

  // Add console message handler to see React errors
  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`[${level}] ${message} (${sourceId}:${line})`);
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
        { 
          label: 'Toggle Developer Tools',
          accelerator: process.platform === 'darwin' ? 'Cmd+Option+I' : 'Ctrl+Shift+I',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.toggleDevTools();
            }
          }
        },
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
    },
    {
      label: 'Debug',
      submenu: [
        {
          label: 'Open Developer Tools',
          accelerator: 'F12',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.openDevTools();
            }
          }
        },
        {
          label: 'Reload App',
          accelerator: 'F5',
          click: () => {
            if (mainWindow) {
              mainWindow.reload();
            }
          }
        }
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