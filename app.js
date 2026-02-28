const I18N = {
    en: {
        title: "Ats's Hindu Calendar", dailyPanc: "Daily Panchang",
        nak: "Nakshatra", yog: "Yoga", kar: "Karana", signs: "Signs", rahu: "Rahu Kaal",
        ritu: "Ritu", vSamvat: "Vikram Samvat",
        tithis: ["Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami", "Jaya Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima", "Amavasya"],
        naks: ["Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashirsha", "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"],
        months: ["Chaitra", "Vaishakha", "Jyeshtha", "Ashadha", "Shravana", "Bhadrapada", "Ashvina", "Kartika", "Margashirsha", "Pausha", "Magha", "Phalguna"],
        days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        ritulist: ["Vasanta", "Grishma", "Varsha", "Sharad", "Hemant", "Shishir"],
        pakshas: ["Shukla Paksha", "Krishna Paksha"],
        rashis: ["Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya", "Tula", "Vrishchika", "Dhanu", "Makara", "Kumbha", "Meena"],
        marriage: "Marriage", naming: "Naming", travel: "Travel"
    },
    hi: {
        title: "आतिश का हिंदू कैलेंडर", dailyPanc: "दैनिक पंचांग",
        nak: "नक्षत्र", yog: "योग", kar: "करण", signs: "राशि", rahu: "राहु काल",
        ritu: "ऋतु", vSamvat: "विक्रम संवत",
        tithis: ["प्रतिपदा", "द्वितीया", "तृतीया", "चतुर्थी", "पंचमी", "षष्ठी", "सप्तमी", "अष्टमी", "नवमी", "दशमी", "जया एकादशी", "द्वादशी", "त्रयोदशी", "चतुर्दशी", "पूर्णिमा", "अमावस्या"],
        naks: ["अश्विनी", "भरणी", "कृत्तिका", "रोहिणी", "मृगशिरा", "आर्द्रा", "पुनर्वसु", "पुष्य", "अश्लेषा", "मघा", "पूर्वा फाल्गुनी", "उत्तरा फाल्गुनी", "हस्त", "चित्रा", "स्वाती", "विशाखा", "अनुराधा", "ज्येष्ठा", "मूल", "पूर्वाषाढ़ा", "उत्तराषाढ़ा", "श्रवण", "धनिष्ठा", "शतभिषा", "पूर्वा भाद्रपद", "उत्तरा भाद्रपद", "रेवती"],
        months: ["चैत्र", "वैशाख", "ज्येष्ठ", "आषाढ़", "श्रावण", "भाद्रपद", "अश्विन", "कार्तिक", "मार्गशीर्ष", "पौष", "माघ", "फाल्गुन"],
        days: ["रविवार", "सोमवार", "मंगलवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार"],
        ritulist: ["वसंत", "ग्रीष्म", "वर्षा", "शरद", "हेमंत", "शिशिर"],
        pakshas: ["शुक्ल पक्ष", "कृष्ण पक्ष"],
        rashis: ["मेष", "वृषभ", "मिथुन", "कर्क", "सिंह", "कन्या", "तुला", "वृश्चिक", "धनु", "मकर", "कुंभ", "मीन"],
        marriage: "विवाह", naming: "नामकरण", travel: "यात्रा"
    }
};

const festivals = { "2026-01-14": "Makar Sankranti", "2026-02-15": "Maha Shivaratri", "2026-02-28": "Jaya Ekadashi", "2026-03-03": "Holi", "2026-03-19": "Hindu New Year", "2026-03-27": "Ram Navami", "2026-04-18": "Akshaya Tritiya" };
const vrats = { "2026-02-28": "Ekadashi Vrat", "2026-03-01": "Pradosh Vrat", "2026-03-07": "Sankashti Chaturthi" };
const sankrantiDates = { "2026-01-14": "Makar", "2026-02-13": "Kumbha", "2026-03-14": "Meena", "2026-04-14": "Mesha" };
const rahuKaalTable = { 0: "04:30 PM - 06:00 PM", 1: "07:30 AM - 09:00 AM", 2: "03:00 PM - 04:30 PM", 3: "12:00 PM - 01:30 PM", 4: "01:30 PM - 03:00 PM", 5: "10:30 AM - 12:00 PM", 6: "09:00 AM - 10:30 AM" };
const rashiSymbols = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];

let currentLang = 'en';
let widgetDate = new Date();

function setText(id, text) { const el = document.getElementById(id); if (el) el.innerText = text; }

function getSolarDay(date) {
    const dStr = date.toISOString().split('T')[0];
    const sorted = Object.keys(sankrantiDates).sort();
    let last = sorted[0];
    for (let s of sorted) { if (s <= dStr) last = s; else break; }
    const diff = Math.floor((date - new Date(last)) / 86400000) + 1;
    return diff > 0 ? diff : 1;
}

function getMuhurats(date) {
    const seed = date.getDate() + (date.getMonth() * 31);
    return { marriage: seed % 7 === 0, naming: seed % 5 === 0, travel: seed % 4 === 0 };
}

function setLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`btn-${lang}`).classList.add('active');
    updateWidget();
}

function setTheme(start, end) {
    document.documentElement.style.setProperty('--p-start', start);
    document.documentElement.style.setProperty('--p-end', end);
    updateWidget();
}

function prevDay(e) { if (e) e.stopPropagation(); widgetDate.setDate(widgetDate.getDate() - 1); updateWidget(); }
function nextDay(e) { if (e) e.stopPropagation(); widgetDate.setDate(widgetDate.getDate() + 1); updateWidget(); }
function goToday() { widgetDate = new Date(); updateWidget(); }

function requestResize() {
    // Wait for CSS transitions to settle, then measure and request resize
    setTimeout(() => {
        const shell = document.getElementById('app-shell');
        if (shell && window.widgetAPI) {
            const h = shell.scrollHeight + 4; // small buffer
            window.widgetAPI.resizeToContent(h);
        }
    }, 550); // after CSS max-height transition
}

function toggleQuickPanchang(e) {
    if (e) e.stopPropagation();
    const dd = document.getElementById('quick-panchang-dropdown');
    const btn = document.getElementById('panchang-btn');
    const arrow = document.getElementById('dropdown-arrow');
    dd.classList.toggle('open');
    btn.classList.toggle('active');
    arrow.classList.toggle('rotated');
    requestResize();
}

function updateWidget() {
    const now = widgetDate;
    const dict = I18N[currentLang];
    const d = now.getDate(), m = now.getMonth(), y = now.getFullYear();
    const seed = d + (m * 31);
    const dateKey = now.toISOString().split('T')[0];
    const isAfterNewYear = (m > 2) || (m === 2 && d >= 19);
    const vsYear = isAfterNewYear ? y + 57 : y + 56;

    setText('widget-large-date', d);
    setText('widget-day-name', dict.days[now.getDay()]);
    setText('widget-full-month', now.toLocaleString(currentLang === 'hi' ? 'hi' : 'en', { month: 'long' }));
    setText('widget-full-year', y);
    setText('widget-hindu-year', `${dict.vSamvat} ${vsYear}`);
    setText('widget-month-label', dict.months[m]);
    setText('app-title-label', dict.title);

    const cs = document.getElementById('central-symbol');
    if (cs) cs.innerText = rashiSymbols[m];

    const isTarget = (d === 28 && m === 1 && y === 2026);
    const tithiIdx = isTarget ? 10 : (seed % 16);
    setText('widget-tithi', `${dict.tithis[tithiIdx]} (${getSolarDay(now)})`);

    const mBox = document.getElementById('widget-muhurat-box');
    if (mBox) {
        mBox.innerHTML = '';
        if (festivals[dateKey]) mBox.innerHTML += `<span class="muhurat-icon" style="background:#fee2e2;color:#dc2626;border:1px solid #fca5a5">🎉 ${festivals[dateKey]}</span>`;
        const md = getMuhurats(now);
        if (md.marriage) mBox.innerHTML += `<span class="muhurat-icon" style="background:#dbeafe;color:#2563eb;border:1px solid #93c5fd">💍 ${dict.marriage}</span>`;
        if (md.naming) mBox.innerHTML += `<span class="muhurat-icon" style="background:#cffafe;color:#0891b2;border:1px solid #67e8f9">🍼 ${dict.naming}</span>`;
        if (md.travel) mBox.innerHTML += `<span class="muhurat-icon" style="background:#e0e7ff;color:#4f46e5;border:1px solid #a5b4fc">🚩 ${dict.travel}</span>`;
    }

    setText('widget-paksha-label', d < 15 ? dict.pakshas[0] : dict.pakshas[1]);
    setText('widget-ritu-label', dict.ritulist[Math.floor(m / 2)]);
    setText('q-sunrise', "06:44 AM");
    setText('q-sunset', "06:18 PM");
    setText('q-nakshatra', dict.naks[seed % 27]);
    setText('q-brahma', "04:52 - 05:40 AM");
    setText('q-yoga', "Shubha");
    setText('q-karana', "Vanija");
    setText('q-rahu', rahuKaalTable[now.getDay()]);
    setText('q-signs', `${dict.rashis[m]} / ${dict.rashis[seed % 12]}`);
    setText('label-daily-panchang', dict.dailyPanc);

    const upList = document.getElementById('upcoming-events-list');
    if (upList) {
        upList.innerHTML = '';
        let count = 0;
        for (let i = 1; i < 60 && count < 3; i++) {
            let cd = new Date(now); cd.setDate(now.getDate() + i);
            let key = cd.toISOString().split('T')[0];
            let label = festivals[key] || vrats[key] || (sankrantiDates[key] ? `${sankrantiDates[key]} Sankranti` : "");
            if (label) {
                upList.innerHTML += `<div class="event-row"><span>${cd.getDate()} ${cd.toLocaleString(currentLang === 'hi' ? 'hi' : 'en', { month: 'short' })}</span><span class="event-label">${label}</span></div>`;
                count++;
            }
        }
    }
}

function openDatePicker() {
    populatePickerOptions();
    document.getElementById('date-picker-modal').classList.remove('hidden');
}
function closeDatePicker() { document.getElementById('date-picker-modal').classList.add('hidden'); }

function applyDatePicker() {
    const d = document.getElementById('select-day').value;
    const m = document.getElementById('select-month').value;
    const y = document.getElementById('select-year').value;
    widgetDate = new Date(parseInt(y), parseInt(m), parseInt(d));
    updateWidget();
    closeDatePicker();
}

function populatePickerOptions() {
    const ds = document.getElementById('select-day');
    const ms = document.getElementById('select-month');
    const ys = document.getElementById('select-year');
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    ds.innerHTML = ""; ms.innerHTML = ""; ys.innerHTML = "";
    for (let i = 1; i <= 31; i++) ds.add(new Option(i, i));
    months.forEach((m, i) => ms.add(new Option(m, i)));
    const cy = widgetDate.getFullYear();
    for (let y = cy - 50; y <= cy + 50; y++) ys.add(new Option(y, y));
    ds.value = widgetDate.getDate();
    ms.value = widgetDate.getMonth();
    ys.value = widgetDate.getFullYear();
}

// Click outside modal to close
document.getElementById('date-picker-modal').addEventListener('click', (e) => {
    if (e.target.id === 'date-picker-modal') closeDatePicker();
});

// Titlebar hover: show on mouse enter app, hide on mouse leave
const TITLEBAR_HEIGHT = 34;
let titlebarVisible = false;
let settingsOpen = false;

const appShell = document.getElementById('app-shell');
const titlebar = document.getElementById('titlebar');

appShell.addEventListener('mouseenter', () => {
    if (!titlebarVisible) {
        titlebarVisible = true;
        titlebar.classList.add('show');
        if (window.widgetAPI) window.widgetAPI.adjustHeight(TITLEBAR_HEIGHT);
    }
});

appShell.addEventListener('mouseleave', () => {
    if (titlebarVisible && !settingsOpen) {
        titlebarVisible = false;
        titlebar.classList.remove('show');
        if (window.widgetAPI) window.widgetAPI.adjustHeight(-TITLEBAR_HEIGHT);
    }
});

// Init
updateWidget();
// Initial resize to fit content
setTimeout(() => requestResize(), 300);

// Settings page switch
function showSettings() {
    settingsOpen = true;
    document.getElementById('page-calendar').classList.add('page-hidden');
    document.getElementById('page-settings').classList.remove('page-hidden');
    // Force titlebar visible
    if (!titlebarVisible) {
        titlebarVisible = true;
        titlebar.classList.add('show');
        if (window.widgetAPI) window.widgetAPI.adjustHeight(TITLEBAR_HEIGHT);
    }
    // Load auto-start state
    if (window.widgetAPI) {
        window.widgetAPI.getAutoStart().then(enabled => {
            document.getElementById('autostart-toggle').checked = enabled;
        });
    }
    // Resize to fit settings content
    setTimeout(() => requestResize(), 100);
}

function hideSettings() {
    settingsOpen = false;
    document.getElementById('page-settings').classList.add('page-hidden');
    document.getElementById('page-calendar').classList.remove('page-hidden');
    // Resize back to calendar content
    setTimeout(() => requestResize(), 100);
}

async function toggleAutoStart(enabled) {
    if (window.widgetAPI) {
        const result = await window.widgetAPI.setAutoStart(enabled);
        document.getElementById('autostart-toggle').checked = result;
    }
}

// Detect platform label
const platformEl = document.getElementById('platform-label');
if (platformEl) {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('linux')) platformEl.textContent = 'Linux';
    else if (ua.includes('mac')) platformEl.textContent = 'macOS';
    else if (ua.includes('win')) platformEl.textContent = 'Windows';
    else platformEl.textContent = 'Cross-platform';
}

// Open website in default browser
function openWebsite() {
    if (window.widgetAPI) {
        window.widgetAPI.openExternal('https://atishaksharma.com/calendar/');
    }
}
