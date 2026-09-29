// Reference values: Meeus worked examples and drikpanchang.com (New Delhi).
const test = require('node:test');
const assert = require('node:assert');
const P = require('../src/lib/panchang.js');

const DELHI = { lat: 28.6139, lon: 77.2090 };
const msFromJde = (jde) => (jde - 2440587.5) * 86400000 - 69.2 * 1000;

test('Sun apparent longitude — Meeus example 25.a', () => {
    assert.ok(Math.abs(P._internal.sunLong(msFromJde(2448908.5)) - 199.90895) < 0.001);
});

test('Moon apparent longitude — Meeus example 47.a', () => {
    assert.ok(Math.abs(P._internal.moonLong(msFromJde(2448724.5)) - 133.167265) < 0.002);
});

test('Tithi boundaries match drikpanchang within 2 minutes', () => {
    const cases = [
        // [day, expected tithi end IST]
        ['2026-11-10', '14:00'], // Kartika Shukla Pratipada ends
        ['2026-11-11', '15:53'], // Dwitiya ends
        ['2025-10-20', '15:44'] // Chaturdashi ends, Amavasya begins (Diwali)
    ];
    for (const [day, hhmm] of cases) {
        const d = P.daily(day, DELHI);
        const [h, m] = hhmm.split(':').map(Number);
        const { y, m: mo, d: dd } = P.parseKey(day);
        const expected = P._internal.istMidnight(y, mo, dd) + (h * 60 + m) * 60000;
        assert.ok(Math.abs(d.tithi.end - expected) < 2 * 60000, `${day}: got ${P.formatTime(d.tithi.end)} want ${hhmm}`);
    }
});

test('Sunrise/sunset New Delhi', () => {
    const d = P.daily('2026-11-11', DELHI);
    assert.strictEqual(P.formatTime(d.sunrise), '06:40');
    assert.strictEqual(P.formatTime(d.sunset), '17:29');
});

const FESTIVALS = {
    'makar-sankranti': ['2025-01-14', '2026-01-14'],
    'vasant-panchami': ['2025-02-02', '2026-01-23'],
    'maha-shivaratri': ['2025-02-26', '2026-02-15'],
    'holika-dahan': ['2025-03-13', '2026-03-03'],
    holi: ['2025-03-14', '2026-03-04'],
    'gudi-padwa': ['2025-03-30', '2026-03-19'],
    'ram-navami': ['2025-04-06', '2026-03-26'],
    'hanuman-jayanti': ['2025-04-12', '2026-04-02'],
    'akshaya-tritiya': ['2025-04-30', '2026-04-19'],
    'buddha-purnima': ['2025-05-12', '2026-05-01'],
    'ganga-dussehra': ['2025-06-05', '2026-05-25'],
    'guru-purnima': ['2025-07-10', '2026-07-29'],
    'hariyali-teej': ['2025-07-27', '2026-08-15'],
    'raksha-bandhan': ['2025-08-09', '2026-08-28'],
    janmashtami: ['2025-08-16', '2026-09-04'],
    'ganesh-chaturthi': ['2025-08-27', '2026-09-14'],
    'sharad-navratri': ['2025-09-22', '2026-10-11'],
    dussehra: ['2025-10-02', '2026-10-20'],
    'sharad-purnima': ['2025-10-06', '2026-10-25'],
    'karva-chauth': ['2025-10-10', '2026-10-29'],
    dhanteras: ['2025-10-18', '2026-11-06'],
    diwali: ['2025-10-20', '2026-11-08'],
    govardhan: ['2025-10-22', '2026-11-10'],
    'bhai-dooj': ['2025-10-23', '2026-11-11'],
    chhath: ['2025-10-27', '2026-11-15'],
    'kartik-purnima': ['2025-11-05', '2026-11-24']
};

test('Festival dates (New Delhi) 2025–2026', () => {
    const found = {};
    let k = '2025-01-01';
    for (let i = 0; i < 730; i++) {
        for (const e of P.events(k, DELHI)) (found[e.id] = found[e.id] || []).push(k);
        k = P.addDays(k, 1);
    }
    for (const [id, dates] of Object.entries(FESTIVALS)) {
        assert.deepStrictEqual(found[id], dates, id);
    }
});

test('Adhik Jyeshtha 2026 detected', () => {
    const d = P.daily('2026-06-01', DELHI);
    assert.strictEqual(d.month.adhik, true);
    assert.strictEqual(d.month.amanta, 2);
});

test('Vikram Samvat rolls over at Chaitra Shukla Pratipada', () => {
    assert.strictEqual(P.daily('2026-03-18', DELHI).samvat.vikram, 2082);
    assert.strictEqual(P.daily('2026-03-19', DELHI).samvat.vikram, 2083);
});

test('Ekadashi names', () => {
    const names = (k) => P.events(k, DELHI).map((e) => e.en);
    assert.ok(names('2025-06-06').includes('Nirjala Ekadashi'));
    assert.ok(names('2025-07-06').includes('Devshayani Ekadashi'));
});
