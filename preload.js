// preload.js - Bridge between renderer and main process
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electronAPI', {
    timerComplete: (timerType) => {
      ipcRenderer.send('timer-complete', timerType);
    },
    closeApp: () => {
      ipcRenderer.send('close-app');
    }
  }
);