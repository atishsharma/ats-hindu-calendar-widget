const { app, BrowserWindow, Tray, Menu, screen, ipcMain, shell, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

const ROOT = path.join(__dirname, '..', '..');
const IS_MAC = process.platform === 'darwin';
const IS_WIN = process.platform === 'win32';
const IS_LINUX = process.platform === 'linux';

// Native Wayland has no always-on-top protocol. Run through XWayland unless the user opts out.
if (IS_LINUX && !process.env.ATS_NATIVE_WAYLAND && !process.argv.some((a) => a.startsWith('--ozone-platform'))) {
    app.commandLine.appendSwitch('ozone-platform', 'x11');
}

if (!app.requestSingleInstanceLock()) {
    app.quit();
    process.exit(0);
}

// ───────────── Settings ─────────────
const DEFAULTS = {
    layout: 'standard', // compact | standard | wide
    theme: 'auto', // auto | light | dark
    accent: 0,
    lang: 'en',
    city: 'new-delhi',
    monthSystem: 'purnimanta', // purnimanta (North India) | amanta (South/West India)
    alwaysOnTop: true,
    locked: false,
    position: null,
    firstRunDone: false
};
const LAYOUT_WIDTH = { compact: 232, standard: 392, wide: 792 };

const settingsFile = () => path.join(app.getPath('userData'), 'settings.json');
let settings = { ...DEFAULTS };

function loadSettings() {
    try {
        settings = { ...DEFAULTS, ...JSON.parse(fs.readFileSync(settingsFile(), 'utf8')) };
    } catch {
        settings = { ...DEFAULTS };
    }
    if (!LAYOUT_WIDTH[settings.layout]) settings.layout = DEFAULTS.layout;
}

let saveTimer;
function saveSettings() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
        try {
            fs.mkdirSync(path.dirname(settingsFile()), { recursive: true });
            fs.writeFileSync(settingsFile(), JSON.stringify(settings, null, 2));
        } catch (err) {
            console.error('Failed to save settings:', err);
        }
    }, 250);
}

// ───────────── Start at login ─────────────
const LINUX_AUTOSTART = path.join(os.homedir(), '.config', 'autostart', 'ats-hindu-calendar.desktop');

function launchCommand() {
    // AppImage: the mounted path changes every run, APPIMAGE points at the real file.
    if (process.env.APPIMAGE) return [process.env.APPIMAGE];
    if (process.env.PORTABLE_EXECUTABLE_FILE) return [process.env.PORTABLE_EXECUTABLE_FILE];
    // Linux builds run through a launcher script next to "<name>.bin" (build/afterPack.js).
    if (app.isPackaged) return [IS_LINUX ? process.execPath.replace(/\.bin$/, '') : process.execPath];
    return [process.execPath, ROOT];
}

const WIN_RUN_NAME = 'AtsHinduCalendar'; // also removed by build/installer.nsh on uninstall

function getAutostart() {
    if (IS_LINUX) return fs.existsSync(LINUX_AUTOSTART);
    if (IS_WIN) {
        const s = app.getLoginItemSettings({ path: launchCommand()[0], args: ['--autostart'] });
        if (Array.isArray(s.launchItems)) return s.launchItems.some((i) => i.name === WIN_RUN_NAME && i.enabled);
        return s.openAtLogin;
    }
    return app.getLoginItemSettings().openAtLogin;
}

function setAutostart(enabled) {
    if (IS_LINUX) {
        if (enabled) {
            const exec = launchCommand().map((p) => `"${p.replace(/"/g, '\\"')}"`).join(' ');
            fs.mkdirSync(path.dirname(LINUX_AUTOSTART), { recursive: true });
            fs.writeFileSync(LINUX_AUTOSTART, [
                '[Desktop Entry]',
                'Type=Application',
                'Name=Ats Hindu Calendar',
                'Comment=Hindu Panchang desktop widget',
                `Exec=${exec} --autostart`,
                ...(fs.existsSync('/usr/share/icons/hicolor/256x256/apps/ats-hindu-calendar.png') ? ['Icon=ats-hindu-calendar'] : []),
                'Terminal=false',
                'X-GNOME-Autostart-enabled=true',
                'X-GNOME-Autostart-Delay=5',
                ''
            ].join('\n'));
        } else if (fs.existsSync(LINUX_AUTOSTART)) {
            fs.unlinkSync(LINUX_AUTOSTART);
        }
    } else if (IS_WIN) {
        app.setLoginItemSettings({ openAtLogin: enabled, name: WIN_RUN_NAME, path: launchCommand()[0], args: ['--autostart'] });
    } else {
        app.setLoginItemSettings({ openAtLogin: enabled });
    }
    return getAutostart();
}

// ───────────── Window ─────────────
let win = null;
let tray = null;

function workAreaFor(x, y) {
    return screen.getDisplayNearestPoint({ x: Math.round(x), y: Math.round(y) }).workArea;
}

function initialPosition(width) {
    const p = settings.position;
    if (p && screen.getAllDisplays().some((d) => {
        const a = d.workArea;
        return p.x >= a.x - 50 && p.x < a.x + a.width - 50 && p.y >= a.y - 20 && p.y < a.y + a.height - 50;
    })) return p;
    const a = screen.getPrimaryDisplay().workArea;
    return { x: a.x + a.width - width - 16, y: a.y + 16 };
}

function applyAlwaysOnTop() {
    if (!win) return;
    const on = settings.alwaysOnTop;
    if (IS_MAC) {
        win.setAlwaysOnTop(on, 'floating');
        // Needed to float over full-screen Spaces; hides the Dock icon while pinned.
        win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: on });
    } else {
        win.setAlwaysOnTop(on, on ? 'screen-saver' : 'normal');
        win.setVisibleOnAllWorkspaces(true);
    }
}

function applyLock() {
    if (!win) return;
    if (!IS_LINUX) win.setMovable(!settings.locked);
}

function createWindow() {
    const width = LAYOUT_WIDTH[settings.layout];
    const pos = initialPosition(width);
    win = new BrowserWindow({
        width,
        height: 600,
        x: pos.x,
        y: pos.y,
        show: false,
        frame: false,
        transparent: true,
        resizable: false,
        hasShadow: false,
        minimizable: false,
        maximizable: false,
        fullscreenable: false,
        alwaysOnTop: settings.alwaysOnTop,
        skipTaskbar: IS_MAC,
        title: 'Ats Hindu Calendar',
        icon: path.join(ROOT, IS_WIN ? 'build/icon.ico' : 'icons/256x256.png'),
        backgroundColor: '#00000000',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true,
            spellcheck: false
        }
    });

    win.loadFile(path.join(ROOT, 'src/renderer/index.html'));

    win.once('ready-to-show', () => {
        applyAlwaysOnTop();
        applyLock();
        if (!process.argv.includes('--hidden')) win.show();
    });

    // X11 window managers drop _NET_WM_STATE_ABOVE when a window is unmapped; re-apply on every show.
    win.on('show', applyAlwaysOnTop);

    // Windows lets other topmost windows take the Z-order; re-assert after focus loss.
    if (IS_WIN) win.on('blur', () => { if (settings.alwaysOnTop) win.setAlwaysOnTop(true, 'screen-saver'); });

    win.on('moved', () => {
        const [x, y] = win.getPosition();
        settings.position = { x, y };
        saveSettings();
    });

    win.on('close', (e) => {
        if (!app.isQuitting) {
            e.preventDefault();
            win.hide();
        }
    });

    win.webContents.setWindowOpenHandler(({ url }) => {
        openExternal(url);
        return { action: 'deny' };
    });
    win.webContents.on('will-navigate', (e) => e.preventDefault());
}

function toggleWindow() {
    if (!win) return;
    if (win.isVisible()) win.hide();
    else { win.show(); win.focus(); }
}

// Resize to the renderer's content, keeping the window on its display.
function fitContent(width, height) {
    if (!win) return;
    const [x, y] = win.getPosition();
    const area = workAreaFor(x, y);
    const w = Math.round(Math.min(width, area.width));
    const h = Math.round(Math.max(120, Math.min(height, area.height)));
    const b = win.getBounds();
    // Widgets parked on the right half grow/shrink leftwards, keeping their right edge.
    const anchorRight = b.width !== w && b.x + b.width / 2 > area.x + area.width / 2;
    const wantX = anchorRight ? b.x + b.width - w : x;
    const nx = Math.min(Math.max(wantX, area.x), area.x + area.width - w);
    const ny = Math.min(Math.max(y, area.y), area.y + area.height - h);
    if (b.width === w && b.height === h && b.x === nx && b.y === ny) return;
    // GTK enforces fixed size hints on non-resizable windows; lift them while resizing.
    if (IS_LINUX) win.setResizable(true);
    win.setBounds({ x: nx, y: ny, width: w, height: h });
    if (IS_LINUX) win.setResizable(false);
}

// ───────────── Tray ─────────────
function trayImage() {
    const img = nativeImage.createFromPath(path.join(ROOT, 'icons', '32x32.png'));
    return IS_MAC ? img.resize({ width: 18, height: 18 }) : img;
}

function buildTrayMenu() {
    if (!tray) return;
    const radio = (key, value, label) => ({
        label, type: 'radio', checked: settings[key] === value, click: () => updateSettings({ [key]: value })
    });
    tray.setContextMenu(Menu.buildFromTemplate([
        { label: win && win.isVisible() ? 'Hide Widget' : 'Show Widget', click: toggleWindow },
        { type: 'separator' },
        {
            label: 'Layout', submenu: [
                radio('layout', 'compact', 'Compact'),
                radio('layout', 'standard', 'Standard'),
                radio('layout', 'wide', 'Wide')
            ]
        },
        {
            label: 'Theme', submenu: [
                radio('theme', 'auto', 'Match System'),
                radio('theme', 'light', 'Light'),
                radio('theme', 'dark', 'Dark')
            ]
        },
        { type: 'separator' },
        { label: 'Always on Top', type: 'checkbox', checked: settings.alwaysOnTop, click: (i) => updateSettings({ alwaysOnTop: i.checked }) },
        { label: 'Lock Position', type: 'checkbox', checked: settings.locked, click: (i) => updateSettings({ locked: i.checked }) },
        { label: 'Start at Login', type: 'checkbox', checked: getAutostart(), click: (i) => updateSettings({ autostart: i.checked }) },
        { type: 'separator' },
        { label: 'Quit', click: quit }
    ]));
}

function createTray() {
    try {
        tray = new Tray(trayImage());
    } catch {
        tray = null;
        return;
    }
    tray.setToolTip('Ats Hindu Calendar');
    tray.on('click', toggleWindow); // Windows/macOS; Linux AppIndicator only shows the menu
    buildTrayMenu();
}

function quit() {
    app.isQuitting = true;
    app.quit();
}

// ───────────── Settings updates ─────────────
function publicSettings() {
    return { ...settings, autostart: getAutostart(), platform: process.platform, version: app.getVersion(), hasTray: !!tray };
}

function updateSettings(patch) {
    const prev = { ...settings };
    if ('autostart' in patch) {
        try { setAutostart(!!patch.autostart); } catch (err) { console.error('autostart:', err); }
        delete patch.autostart;
    }
    for (const k of Object.keys(patch)) if (k in DEFAULTS && k !== 'position') settings[k] = patch[k];
    if (settings.alwaysOnTop !== prev.alwaysOnTop) applyAlwaysOnTop();
    if (settings.locked !== prev.locked) applyLock();
    if (settings.layout !== prev.layout && win) fitContent(LAYOUT_WIDTH[settings.layout], win.getBounds().height);
    saveSettings();
    buildTrayMenu();
    const pub = publicSettings();
    if (win) win.webContents.send('settings:changed', pub);
    return pub;
}

const ALLOWED_HOSTS = new Set(['atishaksharma.com', 'www.atishaksharma.com', 'github.com']);
function openExternal(url) {
    try {
        const u = new URL(url);
        if (u.protocol === 'https:' && ALLOWED_HOSTS.has(u.hostname)) shell.openExternal(u.toString());
    } catch { /* ignore malformed URL */ }
}

ipcMain.handle('settings:get', () => publicSettings());
ipcMain.handle('settings:set', (_e, patch) => updateSettings({ ...patch }));
ipcMain.on('window:fit', (_e, size) => {
    if (size && Number.isFinite(size.width) && Number.isFinite(size.height)) fitContent(size.width, size.height);
});
ipcMain.on('window:hide', () => win && win.hide());
ipcMain.on('app:quit', quit);
ipcMain.on('open-external', (_e, url) => openExternal(url));

// ───────────── Lifecycle ─────────────
app.on('second-instance', () => { if (win) { win.show(); win.focus(); } });

app.whenReady().then(() => {
    loadSettings();
    // Installed builds start at login by default; the user can turn it off in Settings or the tray.
    if (!settings.firstRunDone) {
        settings.firstRunDone = true;
        if (app.isPackaged) {
            try { setAutostart(true); } catch (err) { console.error('autostart:', err); }
        }
        saveSettings();
    }
    if (IS_MAC && app.dock) app.dock.setIcon(path.join(ROOT, 'build/icon.png'));
    createWindow();
    createTray();
    win.on('show', buildTrayMenu);
    win.on('hide', buildTrayMenu);
    screen.on('display-removed', () => {
        if (!win) return;
        const b = win.getBounds();
        fitContent(b.width, b.height);
    });
});

app.on('activate', () => { if (win) win.show(); });
app.on('before-quit', () => { app.isQuitting = true; });
app.on('window-all-closed', () => { if (!IS_MAC) app.quit(); });
