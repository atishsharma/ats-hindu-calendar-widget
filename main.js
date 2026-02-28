const { app, BrowserWindow, Tray, Menu, screen, ipcMain } = require('electron');
const path = require('path');

let mainWindow;
let tray;
let isLocked = false;

function createWindow() {
    const { width: screenWidth } = screen.getPrimaryDisplay().workAreaSize;

    mainWindow = new BrowserWindow({
        width: 380,
        height: 760,
        x: screenWidth - 400,
        y: 20,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        resizable: false,
        skipTaskbar: false,
        hasShadow: false,
        minimizable: false,
        maximizable: false,
        fullscreenable: false,
        icon: path.join(__dirname, 'icon.png'),
        backgroundColor: '#00000000',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    mainWindow.loadFile('index.html');
    mainWindow.setVisibleOnAllWorkspaces(true);

    mainWindow.on('close', (e) => {
        if (!app.isQuitting) {
            e.preventDefault();
            mainWindow.hide();
        }
    });
}

function createTray() {
    const iconPath = path.join(__dirname, 'tray-icon.png');
    try {
        tray = new Tray(iconPath);
    } catch {
        return;
    }

    const contextMenu = Menu.buildFromTemplate([
        { label: 'Show Widget', click: () => mainWindow.show() },
        { label: 'Hide Widget', click: () => mainWindow.hide() },
        { type: 'separator' },
        {
            label: 'Lock Position',
            type: 'checkbox',
            checked: isLocked,
            click: (item) => {
                isLocked = item.checked;
                mainWindow.setMovable(!isLocked);
                mainWindow.webContents.send('lock-state', isLocked);
            }
        },
        {
            label: 'Always on Top',
            type: 'checkbox',
            checked: true,
            click: (item) => {
                mainWindow.setAlwaysOnTop(item.checked);
            }
        },
        { type: 'separator' },
        {
            label: 'Quit',
            click: () => {
                app.isQuitting = true;
                app.quit();
            }
        }
    ]);

    tray.setToolTip("Hindu Calendar Widget");
    tray.setContextMenu(contextMenu);
    tray.on('click', () => {
        if (mainWindow.isVisible()) {
            mainWindow.hide();
        } else {
            mainWindow.show();
        }
    });
}

// IPC: renderer requests window resize to fit content
ipcMain.on('resize-to-content', (event, targetHeight) => {
    if (!mainWindow) return;
    const bounds = mainWindow.getBounds();
    const newHeight = Math.max(200, Math.min(targetHeight, screen.getPrimaryDisplay().workAreaSize.height - 40));
    const currentH = bounds.height;
    const diff = newHeight - currentH;
    const steps = 12;
    const stepSize = diff / steps;
    let step = 0;
    const interval = setInterval(() => {
        step++;
        const h = Math.round(currentH + stepSize * step);
        mainWindow.setBounds({ x: bounds.x, y: bounds.y, width: bounds.width, height: h });
        if (step >= steps) {
            clearInterval(interval);
            mainWindow.setBounds({ x: bounds.x, y: bounds.y, width: bounds.width, height: newHeight });
        }
    }, 16);
});

// IPC: smooth height adjustment (for titlebar show/hide)
ipcMain.on('adjust-height', (event, delta) => {
    if (!mainWindow) return;
    const bounds = mainWindow.getBounds();
    const target = bounds.height + delta;
    const steps = 8;
    const stepSize = delta / steps;
    let step = 0;
    const interval = setInterval(() => {
        step++;
        const h = Math.round(bounds.height + stepSize * step);
        mainWindow.setBounds({ x: bounds.x, y: bounds.y, width: bounds.width, height: h });
        if (step >= steps) {
            clearInterval(interval);
            mainWindow.setBounds({ x: bounds.x, y: bounds.y, width: bounds.width, height: target });
        }
    }, 16);
});

// IPC: auto-start at login (cross-platform)
ipcMain.handle('get-autostart', () => {
    const settings = app.getLoginItemSettings();
    return settings.openAtLogin;
});

ipcMain.handle('set-autostart', (event, enabled) => {
    app.setLoginItemSettings({
        openAtLogin: enabled,
        path: process.execPath,
        args: ['--no-sandbox']
    });
    return app.getLoginItemSettings().openAtLogin;
});

ipcMain.on('widget-action', (event, action) => {
    if (action === 'minimize') mainWindow.hide();
    if (action === 'close') {
        app.isQuitting = true;
        app.quit();
    }
});

// IPC: open URL in default browser
ipcMain.on('open-external', (event, url) => {
    const { shell } = require('electron');
    shell.openExternal(url);
});

app.whenReady().then(() => {
    createWindow();
    createTray();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
