<p align="center">
  <img src="icon.png" alt="Ats's Hindu Calendar" width="120" height="120" style="border-radius: 24px;">
</p>

<h1 align="center">🕉 Ats's Hindu Calendar Widget</h1>

<p align="center">
  <strong>A beautiful, cross-platform desktop widget for the Hindu Panchang calendar.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-blue?style=flat-square" alt="Platform">
  <img src="https://img.shields.io/badge/Built%20with-Electron-47848F?style=flat-square&logo=electron" alt="Electron">
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License">
  <img src="https://img.shields.io/badge/Made%20with-%E2%9D%A4%EF%B8%8F-red?style=flat-square" alt="Love">
</p>

---

## ✨ Features

- 📅 **Daily Panchang** — Tithi, Nakshatra, Yoga, Karana, Rahu Kaal & more
- 🌅 **Sunrise & Sunset** times at a glance
- 🎉 **Festival & Vrat** tracking with upcoming events
- 🔮 **Rashi (Zodiac)** symbol with animated glow
- 💍 **Muhurat Indicators** — Marriage, Naming, Travel
- 🌐 **Bilingual** — English & Hindi (हिंदी) support
- 🎨 **7 Color Themes** — Pink, Blue, Green, Orange, Purple, Cyan, Rose
- 📌 **Always-on-Top** floating widget with system tray
- 🖱️ **Hover Titlebar** — Clean look, appears only when needed
- ⚙️ **Settings Page** — About info, auto-start at login
- 🚀 **Auto-Start** — Launch at system startup (Windows, macOS, Linux)

## 📸 Preview

<p align="center">
  <em>A compact, elegant widget that sits on your desktop</em>
</p>

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or later)
- npm (comes with Node.js)

### Installation

```bash
# Clone the repository
git clone https://github.com/atishsharma/ats-hindu-calendar-widget.git
cd ats-hindu-calendar-widget

# Install dependencies
npm install

# Run the widget
npm start
```

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| Framework | [Electron.js](https://www.electronjs.org/) |
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Fonts | [Google Fonts](https://fonts.google.com/) — Poppins, Marcellus, Noto Sans Devanagari |
| Icons | SVG (Feather Icons style) |

## 📁 Project Structure

```
ats-hindu-calendar-widget/
├── main.js          # Electron main process — window, tray, IPC
├── preload.js       # Secure bridge between main & renderer
├── index.html       # Widget UI structure
├── styles.css       # Complete styling — themes, animations
├── app.js           # Calendar logic, i18n, panchang calculations
├── icon.png         # App icon (256x256)
├── tray-icon.png    # System tray icon (32x32)
├── package.json     # Project config & dependencies
└── README.md        # You are here!
```

## 🎨 Customization

### Color Themes
Click any color circle in the toolbar to switch themes instantly:

| Theme | Colors |
|-------|--------|
| 🔴 Pink | `#FF512F` → `#DD2476` |
| 🔵 Blue | `#2196F3` → `#3F51B5` |
| 🟢 Green | `#4CAF50` → `#009688` |
| 🟠 Orange | `#FF9800` → `#F44336` |
| 🟣 Purple | `#9C27B0` → `#6A1B9A` |
| 🩵 Cyan | `#00BCD4` → `#0097A7` |
| 🌹 Rose | `#E91E63` → `#AD1457` |

### Language
Toggle between **EN** (English) and **हिं** (Hindi) using the language switcher.

## ⚙️ System Tray

Right-click the tray icon for quick actions:
- **Show/Hide** the widget
- **Lock Position** — prevent accidental dragging
- **Always on Top** — toggle floating behavior
- **Quit** — close the app

## 🔧 Development

```bash
# Run in development mode
npm start

# The app uses --no-sandbox flag for Linux compatibility
```

## 📦 Building

To package the app for distribution:

```bash
# Install electron-builder
npm install --save-dev electron-builder

# Build for your platform
npx electron-builder
```

## 🌐 Web Version

A web version of this calendar is also available at:
**[atishaksharma.com/calendar](https://atishaksharma.com/calendar/)**

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Developer

**Atish Ak Sharma**
- 🌐 [atishaksharma.com](https://atishaksharma.com)
- 📧 GitHub: [@atishsharma](https://github.com/atishsharma)

---

<p align="center">
  Made with ❤️ for Open Source
</p>
