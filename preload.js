const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('widgetAPI', {
    minimize: () => ipcRenderer.send('widget-action', 'minimize'),
    close: () => ipcRenderer.send('widget-action', 'close'),
    resizeToContent: (height) => ipcRenderer.send('resize-to-content', height),
    adjustHeight: (delta) => ipcRenderer.send('adjust-height', delta),
    getAutoStart: () => ipcRenderer.invoke('get-autostart'),
    setAutoStart: (enabled) => ipcRenderer.invoke('set-autostart', enabled),
    openExternal: (url) => ipcRenderer.send('open-external', url),
    onLockState: (callback) => ipcRenderer.on('lock-state', (_, state) => callback(state))
});
