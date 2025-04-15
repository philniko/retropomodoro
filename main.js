// app.js
const { app, BrowserWindow, Notification, ipcMain } = require('electron');
const path = require('path');
let mainWindow;

function createWindow() {
  // Icon setup varies by platform
  const iconPath = path.join(__dirname, 'icon.png');
  
  mainWindow = new BrowserWindow({
    width: 300,
    height: 480,
    resizable: false,
    frame: false,
    transparent: false,
    backgroundColor: '#000000',
    icon: iconPath, // This works for Linux
    alwaysOnTop: true, // This makes the window stay on top of other windows
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // Set taskbar icon for Windows
  if (process.platform === 'win32') {
    mainWindow.setIcon(iconPath);
  }

  mainWindow.loadFile('index.html');
}

// Show notification when timer completes
ipcMain.on('timer-complete', (event, timerType) => {
  const title = timerType === 'work' ? 'Work Time Finished!' : 'Break Time Finished!';
  const body = timerType === 'work' ? 'Time for a break.' : 'Back to work!';
  
  const notification = new Notification({
    title: title,
    body: body,
    silent: false,
    icon: path.join(__dirname, 'icon.png') // Add icon to notifications too
  });
  
  notification.show();
  mainWindow.show();
  mainWindow.focus();
});

// Close app
ipcMain.on('close-app', () => {
  app.quit();
});

// Set app icon in the app.whenReady for macOS
app.whenReady().then(() => {
  // For macOS, set the dock icon
  if (process.platform === 'darwin') {
    app.dock.setIcon(path.join(__dirname, 'icon.png'));
  }
  
  createWindow();
  
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});