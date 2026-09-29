# Code Audit — Issues Found (v1.0.0)

> **Status: all items below are addressed in v2.0.0** (rewrite under `src/`).
> Panchang is now calculated astronomically (`src/lib/panchang.js`, verified in `test/`),
> always-on-top / autostart / lock / tray are handled per OS in `src/main/main.js`,
> and packaging for Windows (NSIS + portable), macOS (dmg/zip x64+arm64) and
> Linux (AppImage, deb, tar.gz) runs in `.github/workflows/release.yml`.

## 1. Always-on-Top broken (all OS)

| # | Cause | Where | OS | Fix |
|---|-------|-------|----|-----|
| 1 | Never enabled. No `alwaysOnTop` in constructor, tray checkbox `checked: false`. README claims it's default. | `main.js:51-72`, `main.js:106-112` | all | `alwaysOnTop: true` in `BrowserWindow` opts |
| 2 | Default level `floating` — sits below taskbar, fullscreen apps, other topmost windows. | `main.js:111` | Win, macOS | `setAlwaysOnTop(true, 'screen-saver')` |
| 3 | `setVisibleOnAllWorkspaces(true)` without `visibleOnFullScreen`; on macOS it also resets window collection behavior/level. Called before any on-top call. | `main.js:75` | macOS | `setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })`, then call `setAlwaysOnTop` **after** it; `app.dock.hide()` to float over fullscreen Spaces |
| 4 | `hide()` → `show()` unmaps window; X11 WMs (GNOME/KDE) drop `_NET_WM_STATE_ABOVE`. Tray "Show" never re-applies. | `main.js:95-96,126-131,193` | Linux | Re-apply `setAlwaysOnTop` in `win.on('show')` |
| 5 | Native Wayland has no always-on-top protocol (xdg-shell). Electron ≥38 defaults to Wayland; 35 can pick it via `ELECTRON_OZONE_PLATFORM_HINT`. | — | Linux Wayland | `app.commandLine.appendSwitch('ozone-platform', 'x11')` (XWayland honours `_NET_WM_STATE_ABOVE`) |
| 6 | State not persisted; lost on restart. Tray checkbox not synced if changed elsewhere. | `main.js:106-112` | all | Save to `userData/settings.json`, rebuild menu |
| 7 | Other topmost windows steal Z-order on Windows after focus change. | — | Windows | Re-assert on `blur`: `win.on('blur', () => win.setAlwaysOnTop(true, 'screen-saver'))` |
| 8 | Linux tray: AppIndicator ignores `tray.on('click')`; GNOME w/o AppIndicator extension shows no tray → toggle unreachable. | `main.js:126` | Linux | Add toggle in in-app settings page too |

Suggested patch:

```js
if (process.platform === 'linux') app.commandLine.appendSwitch('ozone-platform', 'x11');

mainWindow = new BrowserWindow({ ..., alwaysOnTop: settings.onTop, type: process.platform === 'linux' ? 'toolbar' : undefined });
mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
applyOnTop(settings.onTop);
mainWindow.on('show', () => applyOnTop(settings.onTop));

function applyOnTop(on) {
  mainWindow.setAlwaysOnTop(on, on ? 'screen-saver' : 'normal');
  if (process.platform === 'darwin') on ? app.dock.hide() : app.dock.show();
}
```

## 2. Main process (`main.js`)

- **Window can't move when titlebar hidden.** Only `#titlebar` has `-webkit-app-region: drag` (`styles.css:40`).
- **Lock Position broken.** `setMovable` no-op on Linux; CSS drag region still active; renderer never subscribes `onLockState` (`preload.js:11` unused).
- **Titlebar × quits app**, not hide (`main.js:191-194`). `−` hides; with no tray (GNOME) window unrecoverable.
- **No single-instance lock.** Multiple launches → multiple windows + trays. Use `app.requestSingleInstanceLock()`.
- **macOS `activate` does nothing.** Window hidden, not destroyed → `getAllWindows().length > 0`. Call `mainWindow.show()`.
- **Auto-start broken on Linux.** `setLoginItemSettings` only supports macOS/Windows → toggle always reverts to off. Write `~/.config/autostart/*.desktop` instead.
- **Auto-start adds `--no-sandbox`** on every platform (`main.js:185`) — disables Chromium sandbox at login. In dev, `process.execPath` = bare electron binary w/o app path.
- **`checkLinuxSandbox`**: runs `unshare` sync before `ready`; if `unshare` missing/blocked by policy but sandbox works otherwise → false exit. Dialog text says "AppImage" even for dev.
- **`open-external` unvalidated** (`main.js:198-201`) — opens any URL/protocol (`file:`, custom schemes). Allow `https:` only.
- **Resize animations race.** `resize-to-content` + `adjust-height` spawn overlapping `setInterval`s, no cancel; start bounds captured once → window snaps/jitters. `adjustHeight` unused.
- **`resizable: false` + `setBounds` size** ignored by some Linux WMs → content clipped.
- **Clamps to primary display** height, positions `x = width - 400` ignoring `workArea.x` → wrong on multi-monitor / left taskbar. Position not persisted.
- **Transparent window on Linux** often renders black without compositor; no fallback.

## 3. Renderer (`app.js`)

- **UTC date-key bug (critical for India).** `toISOString().split('T')[0]` (`app.js:45,98,151`) returns UTC date. Local midnight IST = previous day UTC → festivals/vrats/sankranti shown one day early. Use local `YYYY-MM-DD`.
- **`getSolarDay`**: `new Date('2026-01-14')` parsed as UTC; before 2026-01-14 returns wrong day.
- **Fake Panchang data.** Tithi = `seed % 16`, paksha = `d < 15`, sunrise/sunset/Brahma/Yoga/Karana hard-coded, muhurats pseudo-random, Hindu month/rashi indexed by Gregorian month, Vikram Samvat switches fixed on 19 Mar. Rahu Kaal fixed table (ignores sunrise/location). Needs real astronomical calc (e.g. Swiss Ephemeris / `astronomia`) + location.
- **"Jaya Ekadashi"** used as generic tithi 11 name (it's one specific Ekadashi). `isTarget` special case hack (`app.js:111`).
- **Data only Jan–Apr 2026** (festivals/vrats/sankranti). Other dates empty.
- **Date picker overflow.** Day 31 + Feb → rolls into March (`app.js:139`). Day list always 1–31.
- **Month view overflow.** `setMonth(±1)` from 31st skips months (Jan 31 → Mar 3) (`app.js:290-297`). Set date 1 first.
- **No midnight rollover.** `widgetDate` never refreshes while running.
- **Hindi incomplete.** Hard-coded English: Brahma Muhurat, labels Nakshatra/Yoga/Karana/Rahu Kaal/Signs, Upcoming Events, Today, Month View, month-view weekday headers, festival names, Yoga/Karana values. Dict keys `nak/yog/kar/rahu/signs/ritu` defined but unused.
- **Theme + language not persisted** (only titlebar in localStorage).
- **`innerHTML +=`** in loops — reflows; unsafe if data ever becomes external.
- **Resize via fixed `setTimeout(550)`** guessing CSS transition — use `ResizeObserver`.
- **Version hard-coded** "1.0.0" in settings page; toast mentions AppImage on all OS.

## 4. HTML / CSS / Security

- **No Content-Security-Policy** → Electron security warning. Inline `onclick` handlers block strict CSP.
- **Google Fonts over network** → offline = fallback fonts, privacy leak. Bundle fonts locally.
- Modals `position: fixed` inside small window — clipped when window shorter than modal.
- Month-view button inline styles override theme; no dark mode at all.
- No keyboard/ARIA labels on icon buttons, color circles are `div`s (not focusable).

## 5. Packaging (`package.json`)

- Build scripts **Linux only**; README advertises Windows/macOS — no `win`/`mac` targets.
- `maintainer`/`author` email `@example.com`.
- `electron-builder@24` old vs `electron@35`; bump to 25+.
- No tests, lint, CI.
