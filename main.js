// main.js - Main Electron process
const { app, BrowserWindow, Notification, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 300,
    height: 480,
    resizable: false,
    frame: false,
    transparent: false,
    backgroundColor: '#000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile('index.html');
}

// Show notification when timer completes
ipcMain.on('timer-complete', (event, timerType) => {
  const title = timerType === 'work' ? 'Work Time Finished!' : 'Break Time Finished!';
  const body = timerType === 'work' ? 'Time for a break.' : 'Back to work!';
  
  const notification = new Notification({
    title: title,
    body: body,
    silent: false
  });
  
  notification.show();
  mainWindow.show();
  mainWindow.focus();
});

// Close app
ipcMain.on('close-app', () => {
  app.quit();
});

app.whenReady().then(() => {
  createWindow();
  
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});