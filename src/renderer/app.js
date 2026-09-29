/* global Panchang */
'use strict';

const P = Panchang;
const N = P.NAMES;

const UI = {
    en: {
        today: 'Today', prevDay: 'Previous day', nextDay: 'Next day', monthView: 'Month view', settings: 'Settings',
        vs: 'Vikram Samvat', shaka: 'Shaka', sunrise: 'Sunrise', sunset: 'Sunset', panchang: 'Daily Panchang',
        tithi: 'Tithi', nakshatra: 'Nakshatra', yoga: 'Yoga', karana: 'Karana', moonSign: 'Moon sign', sunSign: 'Sun sign',
        brahma: 'Brahma Muhurat', abhijit: 'Abhijit Muhurat', rahu: 'Rahu Kaal', yama: 'Yamaganda', gulika: 'Gulika Kaal',
        ritu: 'Ritu', month: 'Month', till: 'till', upto: 'upto', then: 'then', upcoming: 'Upcoming', none: 'No events in the next few months',
        festivalsVrats: 'Festivals & vrats', fest: 'Festival', vrat: 'Vrat', national: 'National holiday',
        layout: 'Layout', compact: 'Compact', standard: 'Standard', wide: 'Wide',
        theme: 'Theme', auto: 'Auto', light: 'Light', dark: 'Dark', accent: 'Accent', language: 'Language',
        city: 'City', cityHint: 'Sunrise-based timings (IST)', monthSystem: 'Month system',
        purnimanta: 'Purnimanta', amanta: 'Amanta', monthHint: 'North India · South/West India',
        onTop: 'Always on top', onTopHint: 'Keep widget above other windows',
        lock: 'Lock position', lockHint: 'Prevent dragging',
        autostart: 'Start at login', autostartHint: 'Launch when you sign in',
        about: 'About', website: 'Website', hide: 'Hide widget', quit: 'Quit', back: 'Back',
        version: 'Version', dataNote: 'Calculated on-device with Lahiri ayanamsa. Festival dates follow common North-Indian (Drik) rules; regional customs may differ by a day.',
        autostartOn: 'Will start at login', autostartOff: 'Start at login disabled',
        adhik: 'Adhik', weekdaysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], nextDayMark: '+1'
    },
    hi: {
        today: 'आज', prevDay: 'पिछला दिन', nextDay: 'अगला दिन', monthView: 'माह दृश्य', settings: 'सेटिंग्स',
        vs: 'विक्रम संवत', shaka: 'शक', sunrise: 'सूर्योदय', sunset: 'सूर्यास्त', panchang: 'दैनिक पंचांग',
        tithi: 'तिथि', nakshatra: 'नक्षत्र', yoga: 'योग', karana: 'करण', moonSign: 'चंद्र राशि', sunSign: 'सूर्य राशि',
        brahma: 'ब्रह्म मुहूर्त', abhijit: 'अभिजीत मुहूर्त', rahu: 'राहु काल', yama: 'यमगण्ड', gulika: 'गुलिक काल',
        ritu: 'ऋतु', month: 'माह', till: 'तक', upto: 'तक', then: 'फिर', upcoming: 'आगामी', none: 'आगामी महीनों में कोई पर्व नहीं',
        festivalsVrats: 'पर्व और व्रत', fest: 'पर्व', vrat: 'व्रत', national: 'राष्ट्रीय पर्व',
        layout: 'लेआउट', compact: 'छोटा', standard: 'सामान्य', wide: 'चौड़ा',
        theme: 'थीम', auto: 'स्वतः', light: 'लाइट', dark: 'डार्क', accent: 'रंग', language: 'भाषा',
        city: 'शहर', cityHint: 'सूर्योदय आधारित समय (IST)', monthSystem: 'मास पद्धति',
        purnimanta: 'पूर्णिमांत', amanta: 'अमांत', monthHint: 'उत्तर भारत · दक्षिण/पश्चिम भारत',
        onTop: 'सबसे ऊपर रखें', onTopHint: 'विजेट को अन्य विंडो के ऊपर रखें',
        lock: 'स्थान लॉक करें', lockHint: 'खिसकाना बंद करें',
        autostart: 'लॉगिन पर शुरू करें', autostartHint: 'साइन-इन होते ही खोलें',
        about: 'परिचय', website: 'वेबसाइट', hide: 'विजेट छुपाएँ', quit: 'बंद करें', back: 'वापस',
        version: 'संस्करण', dataNote: 'लाहिरी अयनांश से डिवाइस पर गणना। पर्व तिथियाँ उत्तर भारतीय (दृक) नियमों पर आधारित; क्षेत्रीय परंपरा में एक दिन का अंतर संभव।',
        autostartOn: 'लॉगिन पर शुरू होगा', autostartOff: 'लॉगिन पर शुरू होना बंद',
        adhik: 'अधिक', weekdaysShort: ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'], nextDayMark: '+1'
    }
};

const ACCENTS = [
    ['#ff6a3d', '#e8317a'], ['#0a84ff', '#5e5ce6'], ['#30d158', '#00a3a3'], ['#ff9f0a', '#ff453a'],
    ['#bf5af2', '#7d3cff'], ['#64d2ff', '#0a84ff'], ['#ff375f', '#c2185b']
];
const GREG_MONTHS = {
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    hi: ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर']
};
const GREG_SHORT = {
    en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    hi: ['जन', 'फ़र', 'मार्च', 'अप्रै', 'मई', 'जून', 'जुला', 'अग', 'सित', 'अक्टू', 'नव', 'दिस']
};
const shortMonth = (m) => GREG_SHORT[state.settings.lang][m - 1];

const api = window.widgetAPI || null;
const state = {
    settings: {
        layout: 'standard', theme: 'auto', accent: 0, lang: 'en', city: 'new-delhi', monthSystem: 'purnimanta',
        alwaysOnTop: true, locked: false, autostart: false, version: '', platform: ''
    },
    view: 'day',
    selected: P.todayKey(),
    today: P.todayKey(),
    monthCursor: null, // 'YYYY-MM'
    panchangOpen: false
};

// ───────────── Helpers ─────────────
const $ = (sel, el = document) => el.querySelector(sel);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const t = (k) => UI[state.settings.lang][k] ?? UI.en[k];
const names = () => N[state.settings.lang];
const loc = () => P.CITIES.find((c) => c.id === state.settings.city) || P.CITIES[0];

// "14:05" or "14:05 +1" when the moment falls after the day being viewed
function timeLabel(ms, dayKey) {
    const s = P.formatTime(ms);
    const k = P.todayKey(ms);
    if (k > dayKey) return `${s} <small>${t('nextDayMark')}</small>`;
    return s;
}

function monthName(d) {
    const idx = state.settings.monthSystem === 'amanta' ? d.month.amanta : d.month.purnimanta;
    return (d.month.adhik ? names().adhik + ' ' : '') + names().month[idx];
}

function gregLabel(key, withYear = true) {
    const { y, m } = P.parseKey(key);
    return `${GREG_MONTHS[state.settings.lang][m - 1]}${withYear ? ' ' + y : ''}`;
}

function eventName(e) { return state.settings.lang === 'hi' ? e.hi : e.en; }

function moonSVG(elong, size) {
    const r = 10;
    const k = Math.cos(elong * Math.PI / 180);
    const waxing = elong <= 180;
    const rx = Math.abs(k) * r;
    const limb = waxing ? 1 : 0;
    const term = waxing ? (k > 0 ? 0 : 1) : (k > 0 ? 1 : 0);
    const path = `M0 ${-r} A ${r} ${r} 0 0 ${limb} 0 ${r} A ${rx} ${r} 0 0 ${term} 0 ${-r} Z`;
    return `<svg class="moon" width="${size}" height="${size}" viewBox="-11 -11 22 22" aria-hidden="true">
        <circle class="base" r="${r}"/><path class="lit" d="${path}"/></svg>`;
}

const ICON_SUNRISE = '<svg viewBox="0 0 24 24"><path d="M12 3v5M5.6 8.6l1.4 1.4M18.4 8.6L17 10M3 17h18M7 17a5 5 0 0 1 10 0"/><path d="M9 5.5l3-2.5 3 2.5"/></svg>';
const ICON_SUNSET = '<svg viewBox="0 0 24 24"><path d="M12 8V3M5.6 8.6l1.4 1.4M18.4 8.6L17 10M3 17h18M7 17a5 5 0 0 1 10 0"/><path d="M9 5.5l3 2.5 3-2.5"/></svg>';
const CHEV = '<svg class="chev" width="14" height="14" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>';

// ───────────── Pieces ─────────────
function heroHTML(d) {
    const { d: day } = P.parseKey(d.key);
    return `<div class="hero">
        <div class="big-num">${day}</div>
        <div class="stack">
            <span class="eyebrow">${t('vs')} ${d.samvat.vikram}</span>
            <span class="wd">${names().weekday[d.weekday]}</span>
            <span class="greg">${gregLabel(d.key)}</span>
        </div>
    </div>`;
}

function tithiCardHTML(d, evs) {
    const n = names();
    const next = d.nextTithi ? ` · ${t('then')} ${n.tithi[d.nextTithi.name]}` : '';
    const chips = evs.slice(0, 3).map((e) =>
        `<span class="chip ${e.type === 'vrat' ? 'vrat' : 'accent'}"><span class="d"></span>${esc(eventName(e))}</span>`).join('');
    return `<div class="tithi-card tile">
        ${moonSVG(d.moonPhase.elongation, 46)}
        <div style="min-width:0">
            <h3>${n.tithi[d.tithi.name]}</h3>
            <div class="sub">${n.paksha[d.paksha]} · ${monthName(d)}</div>
            <div class="till">${t('upto')} ${timeLabel(d.tithi.end, d.key)}${next}</div>
            <div class="chips">${chips}<span class="chip">${n.ritu[d.ritu]}</span></div>
        </div>
    </div>`;
}

function sunHTML(d) {
    return `<div class="sun">
        <div class="tile">${ICON_SUNRISE}<div><small>${t('sunrise')}</small><b>${P.formatTime(d.sunrise)}</b></div></div>
        <div class="tile">${ICON_SUNSET}<div><small>${t('sunset')}</small><b>${P.formatTime(d.sunset)}</b></div></div>
    </div>`;
}

function range(r) { return r ? `${P.formatTime(r.start)} – ${P.formatTime(r.end)}` : '—'; }

function detailRows(d, compact) {
    const n = names();
    const rows = [
        ['', t('nakshatra'), `${n.nakshatra[d.nakshatra.index]}<small>${t('upto')} ${timeLabel(d.nakshatra.end, d.key)}</small>`],
        ['', t('yoga'), `${n.yoga[d.yoga.index]}<small>${t('upto')} ${timeLabel(d.yoga.end, d.key)}</small>`],
        ['', t('karana'), `${n.karana[d.karana.index]}<small>${t('upto')} ${timeLabel(d.karana.end, d.key)}</small>`],
        ['', t('moonSign'), n.rashi[d.moonRashi]],
        ['warn', t('rahu'), range(d.rahuKaal)]
    ];
    if (!compact) {
        rows.splice(4, 0, ['', t('sunSign'), n.rashi[d.sunRashi]]);
        rows.push(['good', t('abhijit'), range(d.abhijit)]);
        rows.push(['', t('brahma'), range(d.brahmaMuhurta)]);
        rows.push(['', t('yama'), range(d.yamaganda)]);
        rows.push(['', t('gulika'), range(d.gulika)]);
        rows.push(['', t('shaka'), String(d.samvat.shaka)]);
    }
    return rows.map(([cls, k, v]) => `<div class="kv ${cls}"><span>${k}</span><span>${v}</span></div>`).join('');
}

function upcomingHTML(fromKey, count) {
    const list = P.upcoming(fromKey, loc(), count, 150, ['festival', 'national', 'vrat']);
    if (!list.length) return `<div class="empty">${t('none')}</div>`;
    return list.map((e) => {
        const { d, m } = P.parseKey(e.key);
        const wd = UI[state.settings.lang].weekdaysShort[P.weekday(e.key)];
        return `<button class="ev tile" data-go="${e.key}">
            <div class="dd"><b>${String(d).padStart(2, '0')}</b><small>${shortMonth(m)}</small></div>
            <div class="t">${esc(eventName(e))}<small>${wd} · ${t(e.type === 'vrat' ? 'vrat' : e.type === 'national' ? 'national' : 'fest')}</small></div>
        </button>`;
    }).join('');
}

function monthGridHTML(cursor) {
    const [y, m] = cursor.split('-').map(Number);
    const first = P.keyOf(y, m, 1);
    const lead = P.weekday(first);
    const daysIn = new Date(Date.UTC(y, m, 0)).getUTCDate();
    const n = names();
    const heads = UI[state.settings.lang].weekdaysShort.map((w) => `<div class="h">${w.slice(0, state.settings.lang === 'hi' ? 4 : 2)}</div>`).join('');
    let cells = '';
    const total = Math.ceil((lead + daysIn) / 7) * 7;
    for (let i = 0; i < total; i++) {
        const key = P.addDays(first, i - lead);
        const inMonth = i >= lead && i < lead + daysIn;
        const dd = P.parseKey(key).d;
        const info = P.daily(key, loc());
        const evs = P.events(key, loc());
        const tnum = info.tithi.num;
        const cls = ['c',
            inMonth ? '' : 'x',
            key === state.today ? 'today' : '',
            key === state.selected && key !== state.today ? 'sel' : '',
            evs.some((e) => e.type === 'festival' || e.type === 'national') ? 'fest' : '',
            tnum === 14 ? 'purnima' : '', tnum === 29 ? 'amavasya' : ''
        ].filter(Boolean).join(' ');
        const short = tnum === 14 ? '○' : tnum === 29 ? '●' : `${tnum < 15 ? (state.settings.lang === 'hi' ? 'शु' : 'S') : (state.settings.lang === 'hi' ? 'कृ' : 'K')}${(tnum % 15) + 1}`;
        const title = [n.tithi[info.tithi.name], ...evs.map(eventName)].join(' · ');
        cells += `<button class="${cls}" data-go="${key}" title="${esc(title)}">${dd}<small>${short}</small></button>`;
    }
    const mid = P.daily(P.keyOf(y, m, 15), loc());
    return `<div class="month-head">
            <div><b>${gregLabel(first)}</b><div class="sub">${monthName(P.daily(first, loc()))} – ${monthName(P.daily(P.keyOf(y, m, daysIn), loc()))} · ${t('vs')} ${mid.samvat.vikram}</div></div>
            <div style="display:flex;gap:5px">
                <button class="icon-btn" data-act="month-prev"><svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg></button>
                <button class="icon-btn" data-act="month-next"><svg viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg></button>
            </div>
        </div>
        <div class="cal">${heads}${cells}</div>`;
}

// ───────────── Views ─────────────
function renderDay() {
    const d = P.daily(state.selected, loc());
    const evs = P.events(state.selected, loc());
    const el = $('#view-day');
    const layout = state.settings.layout;

    if (layout === 'compact') {
        const fest = evs[0] || P.upcoming(state.selected, loc(), 1, 60, ['festival', 'national'])[0];
        const festLabel = fest ? (fest.key ? `${P.parseKey(fest.key).d} ${shortMonth(P.parseKey(fest.key).m)} · ` : '') + eventName(fest) : '';
        el.innerHTML = `<div class="compact-view">
            <div class="top">
                <span class="eyebrow">${UI[state.settings.lang].weekdaysShort[d.weekday]} · ${shortMonth(P.parseKey(d.key).m)}</span>
                ${moonSVG(d.moonPhase.elongation, 28)}
            </div>
            <div>
                <div class="big-num">${P.parseKey(d.key).d}</div>
                <div class="tithi">${names().tithi[d.tithi.name]}</div>
                <div class="sub">${names().pakshaShort[d.paksha]} · ${monthName(d)}</div>
                ${festLabel ? `<div class="fest">${esc(festLabel)}</div>` : ''}
            </div>
        </div>`;
        return;
    }

    if (layout === 'wide') {
        el.innerHTML = `<div class="wide-grid">
            <div class="col">${heroHTML(d)}${tithiCardHTML(d, evs)}${sunHTML(d)}</div>
            <div class="col">${monthGridHTML(state.monthCursor)}</div>
            <div class="col">
                <div class="panchang tile">${detailRows(d, true)}</div>
                <div class="section-label">${t('upcoming')}</div>
                <div class="events">${upcomingHTML(state.selected, 3)}</div>
            </div>
        </div>`;
        return;
    }

    el.innerHTML = `${heroHTML(d)}${tithiCardHTML(d, evs)}${sunHTML(d)}
        <div class="panchang tile">
            <details ${state.panchangOpen ? 'open' : ''} id="panchang-details">
                <summary><span>${t('panchang')}</span>${CHEV}</summary>
                ${detailRows(d, false)}
            </details>
        </div>
        <div class="section-label">${t('upcoming')}</div>
        <div class="events">${upcomingHTML(state.selected, 3)}</div>`;
    $('#panchang-details').addEventListener('toggle', (e) => { state.panchangOpen = e.target.open; });
}

function renderMonth() {
    $('#view-month').innerHTML = monthGridHTML(state.monthCursor) +
        `<div class="legend"><span><i></i>${t('festivalsVrats')}</span><span>○ Purnima</span><span>● Amavasya</span></div>`;
}

function seg(key, options) {
    return `<div class="seg" data-seg="${key}">${options.map(([v, label]) =>
        `<button data-v="${v}" class="${String(state.settings[key]) === String(v) ? 'on' : ''}">${label}</button>`).join('')}</div>`;
}

function toggle(key, checked) {
    return `<label class="switch"><input type="checkbox" data-toggle="${key}" ${checked ? 'checked' : ''}><span></span></label>`;
}

function renderSettings() {
    const s = state.settings;
    const lang = s.lang;
    const cities = [...P.CITIES].sort((a, b) => a.en.localeCompare(b.en))
        .map((c) => `<option value="${c.id}" ${c.id === s.city ? 'selected' : ''}>${esc(lang === 'hi' ? c.hi : c.en)}</option>`).join('');
    $('#view-settings').innerHTML = `<div class="settings">
        <div class="set-group tile">
            <div class="set-row"><div class="l"><b>${t('layout')}</b></div>${seg('layout', [['compact', t('compact')], ['standard', t('standard')], ['wide', t('wide')]])}</div>
            <div class="set-row"><div class="l"><b>${t('theme')}</b></div>${seg('theme', [['auto', t('auto')], ['light', t('light')], ['dark', t('dark')]])}</div>
            <div class="set-row"><div class="l"><b>${t('accent')}</b></div><div class="swatches">${ACCENTS.map(([a, b], i) =>
                `<button class="sw ${i === s.accent ? 'on' : ''}" data-accent="${i}" style="background:linear-gradient(135deg,${a},${b})" aria-label="Accent ${i + 1}"></button>`).join('')}</div></div>
            <div class="set-row"><div class="l"><b>${t('language')}</b></div>${seg('lang', [['en', 'English'], ['hi', 'हिंदी']])}</div>
        </div>
        <div class="set-group tile">
            <div class="set-row"><div class="l"><b>${t('city')}</b><small>${t('cityHint')}</small></div><select data-select="city">${cities}</select></div>
            <div class="set-row"><div class="l"><b>${t('monthSystem')}</b><small>${t('monthHint')}</small></div>${seg('monthSystem', [['purnimanta', t('purnimanta')], ['amanta', t('amanta')]])}</div>
        </div>
        <div class="set-group tile">
            <div class="set-row"><div class="l"><b>${t('onTop')}</b><small>${t('onTopHint')}</small></div>${toggle('alwaysOnTop', s.alwaysOnTop)}</div>
            <div class="set-row"><div class="l"><b>${t('lock')}</b><small>${t('lockHint')}</small></div>${toggle('locked', s.locked)}</div>
            <div class="set-row"><div class="l"><b>${t('autostart')}</b><small>${t('autostartHint')}</small></div>${toggle('autostart', s.autostart)}</div>
        </div>
        <div class="about tile">
            <img src="../../icons/128x128.png" alt="">
            <div style="flex:1;min-width:0"><b>Ats's Hindu Calendar</b><small>${t('version')} ${esc(s.version || '')} · Atish Ak Sharma</small></div>
            <button class="link" data-act="website">${t('website')} ↗</button>
        </div>
        <p class="note">${t('dataNote')}</p>
        <div class="btn-row">
            <button class="btn" data-act="hide">${t('hide')}</button>
            <button class="btn danger" data-act="quit">${t('quit')}</button>
        </div>
        <button class="btn primary" data-act="view-day">${t('back')}</button>
    </div>`;
}

function render() {
    const s = state.settings;
    const root = document.documentElement;
    root.lang = s.lang;
    root.dataset.layout = s.layout;
    root.dataset.view = state.view;
    applyTheme();
    const [a, b] = ACCENTS[s.accent] || ACCENTS[0];
    root.style.setProperty('--accent', a);
    root.style.setProperty('--accent-2', b);
    document.body.classList.toggle('locked', !!s.locked);

    if (!state.monthCursor) state.monthCursor = state.selected.slice(0, 7);

    // Bar
    const d = P.daily(state.selected, loc());
    $('#bar-title').textContent = state.view === 'settings' ? t('settings')
        : state.view === 'month' ? t('monthView')
            : `${loc()[s.lang === 'hi' ? 'hi' : 'en']} · ${monthName(d)}`;
    $('.dot.pin').classList.toggle('on', !!s.alwaysOnTop);
    $('[data-act="today"]').textContent = t('today');
    $('[data-act="today"]').classList.toggle('active', state.selected !== state.today);
    $('[data-act="view-month"]').classList.toggle('active', state.view === 'month');
    $('[data-act="view-settings"]').classList.toggle('active', state.view === 'settings');
    document.querySelectorAll('[data-i18n-title]').forEach((el) => { el.title = t(el.dataset.i18nTitle); });

    $('#view-day').hidden = state.view !== 'day';
    $('#view-month').hidden = state.view !== 'month';
    $('#view-settings').hidden = state.view !== 'settings';
    if (state.view === 'day') renderDay();
    else if (state.view === 'month') renderMonth();
    else renderSettings();
    requestFit();
}

// ───────────── Theme ─────────────
const darkMQ = window.matchMedia('(prefers-color-scheme: dark)');
function applyTheme() {
    const th = state.settings.theme;
    document.documentElement.dataset.theme = th === 'auto' ? (darkMQ.matches ? 'dark' : 'light') : th;
}
darkMQ.addEventListener('change', applyTheme);

// ───────────── Window fit ─────────────
let fitRaf = 0;
function requestFit() {
    if (!api) return;
    cancelAnimationFrame(fitRaf);
    fitRaf = requestAnimationFrame(() => {
        const card = $('#card');
        const pad = parseFloat(getComputedStyle(document.body).paddingLeft) || 0;
        api.fit(Math.ceil(card.offsetWidth + pad * 2), Math.ceil(card.offsetHeight + pad * 2));
    });
}
new ResizeObserver(requestFit).observe($('#card'));

// ───────────── Actions ─────────────
async function setSetting(patch) {
    Object.assign(state.settings, patch);
    if (api) Object.assign(state.settings, await api.setSettings(patch));
    render();
}

function toast(msg) {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove('show'), 2600);
}

function go(key) {
    state.selected = key;
    state.monthCursor = key.slice(0, 7);
    render();
}

function shiftMonth(delta) {
    const [y, m] = state.monthCursor.split('-').map(Number);
    const dt = new Date(Date.UTC(y, m - 1 + delta, 1));
    state.monthCursor = `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, '0')}`;
    render();
}

const ACTIONS = {
    hide: () => api && api.hide(),
    quit: () => api && api.quit(),
    'toggle-top': () => setSetting({ alwaysOnTop: !state.settings.alwaysOnTop }),
    prev: () => go(P.addDays(state.selected, -1)),
    next: () => go(P.addDays(state.selected, 1)),
    today: () => { state.view = state.view === 'settings' ? 'day' : state.view; go(state.today); },
    'view-month': () => {
        if (state.settings.layout === 'wide') { state.view = 'day'; render(); return; }
        state.view = state.view === 'month' ? 'day' : 'month';
        state.monthCursor = state.selected.slice(0, 7);
        render();
    },
    'view-settings': () => { state.view = state.view === 'settings' ? 'day' : 'settings'; render(); },
    'view-day': () => { state.view = 'day'; render(); },
    'month-prev': () => shiftMonth(-1),
    'month-next': () => shiftMonth(1),
    website: () => api && api.openExternal('https://atishaksharma.com/calendar/')
};

document.addEventListener('click', (e) => {
    const goEl = e.target.closest('[data-go]');
    if (goEl) {
        go(goEl.dataset.go);
        if (state.view === 'month') { state.view = 'day'; render(); }
        return;
    }
    const act = e.target.closest('[data-act]');
    if (act && ACTIONS[act.dataset.act]) { ACTIONS[act.dataset.act](); return; }
    const segBtn = e.target.closest('[data-seg] button');
    if (segBtn) {
        const key = segBtn.parentElement.dataset.seg;
        if (key === 'layout') state.view = 'day';
        setSetting({ [key]: segBtn.dataset.v });
        return;
    }
    const sw = e.target.closest('[data-accent]');
    if (sw) setSetting({ accent: Number(sw.dataset.accent) });
});

document.addEventListener('change', async (e) => {
    const tg = e.target.closest('[data-toggle]');
    if (tg) {
        const key = tg.dataset.toggle;
        await setSetting({ [key]: tg.checked });
        if (key === 'autostart') toast(state.settings.autostart ? t('autostartOn') : t('autostartOff'));
        return;
    }
    const sel = e.target.closest('[data-select]');
    if (sel) setSetting({ [sel.dataset.select]: sel.value });
});

document.addEventListener('keydown', (e) => {
    if (e.target.matches('select, input')) return;
    if (e.key === 'ArrowLeft') ACTIONS.prev();
    else if (e.key === 'ArrowRight') ACTIONS.next();
    else if (e.key === 't' || e.key === 'T') ACTIONS.today();
    else if (e.key === 'Escape' && state.view !== 'day') ACTIONS['view-day']();
});

// Midnight rollover (IST) — follow "today" if it was selected.
setInterval(() => {
    const now = P.todayKey();
    if (now !== state.today) {
        const followed = state.selected === state.today;
        state.today = now;
        if (followed) state.selected = now;
        render();
    }
}, 30000);

// ───────────── Boot ─────────────
(async function init() {
    if (api) {
        Object.assign(state.settings, await api.getSettings());
        api.onSettings((s) => { Object.assign(state.settings, s); render(); });
    } else {
        // Browser preview: allow ?layout=wide&theme=light&lang=hi&view=settings
        const q = new URLSearchParams(location.search);
        for (const k of ['layout', 'theme', 'lang', 'city']) if (q.get(k)) state.settings[k] = q.get(k);
        if (q.get('date')) { state.selected = q.get('date'); }
        if (q.get('view')) state.view = q.get('view');
    }
    render();
})();
