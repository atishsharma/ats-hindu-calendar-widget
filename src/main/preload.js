const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('widgetAPI', {
    getSettings: () => ipcRenderer.invoke('settings:get'),
    setSettings: (patch) => ipcRenderer.invoke('settings:set', patch),
    onSettings: (cb) => ipcRenderer.on('settings:changed', (_e, s) => cb(s)),
    fit: (width, height) => ipcRenderer.send('window:fit', { width, height }),
    hide: () => ipcRenderer.send('window:hide'),
    quit: () => ipcRenderer.send('app:quit'),
    openExternal: (url) => ipcRenderer.send('open-external', url)
});
