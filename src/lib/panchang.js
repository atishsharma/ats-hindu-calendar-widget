/*
 * Panchang engine — astronomical Hindu calendar calculations for India.
 *
 * Sun: Meeus, Astronomical Algorithms ch. 25 (≈0.01°).
 * Moon: Meeus ch. 47 (ELP-2000/82 truncated, ≈10").
 * Sidereal zodiac: Lahiri (Chitrapaksha) ayanamsa.
 * Sunrise/sunset: upper limb with standard refraction (-0.833°).
 * All civil dates and clock times are Indian Standard Time (UTC+05:30).
 * Lunar months follow the new-moon (amanta) definition; purnimanta names
 * are derived from it. Festivals are resolved from tithi/month rules.
 */
(function (root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory();
    else root.Panchang = factory();
})(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    const IST_OFFSET_MS = 330 * 60000;
    const DAY_MS = 86400000;
    const HOUR_MS = 3600000;
    const DEG = Math.PI / 180;

    const norm360 = (x) => ((x % 360) + 360) % 360;
    const norm180 = (x) => { const v = norm360(x); return v > 180 ? v - 360 : v; };
    const sin = (d) => Math.sin(d * DEG);
    const cos = (d) => Math.cos(d * DEG);

    // ───────────── Time ─────────────
    const jdUT = (ms) => ms / DAY_MS + 2440587.5;
    // ΔT (TT − UT) ≈ 69 s through the 2020s; error of a few seconds is irrelevant here.
    const jdTT = (ms) => jdUT(ms) + 69.2 / 86400;
    const centuries = (jde) => (jde - 2451545.0) / 36525;

    // Civil IST date helpers. A "day key" is 'YYYY-MM-DD' in IST.
    function istParts(ms) {
        const d = new Date(ms + IST_OFFSET_MS);
        return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate(), wd: d.getUTCDay() };
    }
    function keyOf(y, m, d) {
        return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
    function parseKey(key) {
        const [y, m, d] = key.split('-').map(Number);
        return { y, m, d };
    }
    // UTC ms of IST midnight that starts the given civil day.
    function istMidnight(y, m, d) { return Date.UTC(y, m - 1, d) - IST_OFFSET_MS; }
    function keyFromMs(ms) { const p = istParts(ms); return keyOf(p.y, p.m, p.d); }
    function addDays(key, n) {
        const { y, m, d } = parseKey(key);
        const t = new Date(Date.UTC(y, m - 1, d + n));
        return keyOf(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate());
    }
    function todayKey(now = Date.now()) { return keyFromMs(now); }
    function weekday(key) { const { y, m, d } = parseKey(key); return new Date(Date.UTC(y, m - 1, d)).getUTCDay(); }
    function formatTime(ms) {
        const d = new Date(ms + IST_OFFSET_MS);
        return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
    }

    // ───────────── Sun ─────────────
    function sunApparent(jde) {
        const T = centuries(jde);
        const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
        const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
        const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * sin(M)
            + (0.019993 - 0.000101 * T) * sin(2 * M)
            + 0.000289 * sin(3 * M);
        const omega = 125.04 - 1934.136 * T;
        const lambda = norm360(L0 + C - 0.00569 - 0.00478 * sin(omega));
        const eps = 23.439291 - 0.0130042 * T + 0.00256 * cos(omega);
        return { lambda, eps };
    }

    // ───────────── Moon (Meeus table 47.A, longitude terms) ─────────────
    // [D, M, M', F, Σl coefficient ×1e-6 deg]
    const MOON_TERMS = [
        [0, 0, 1, 0, 6288774], [2, 0, -1, 0, 1274027], [2, 0, 0, 0, 658314], [0, 0, 2, 0, 213618],
        [0, 1, 0, 0, -185116], [0, 0, 0, 2, -114332], [2, 0, -2, 0, 58793], [2, -1, -1, 0, 57066],
        [2, 0, 1, 0, 53322], [2, -1, 0, 0, 45758], [0, 1, -1, 0, -40923], [1, 0, 0, 0, -34720],
        [0, 1, 1, 0, -30383], [2, 0, 0, -2, 15327], [0, 0, 1, 2, -12528], [0, 0, 1, -2, 10980],
        [4, 0, -1, 0, 10675], [0, 0, 3, 0, 10034], [4, 0, -2, 0, 8548], [2, 1, -1, 0, -7888],
        [2, 1, 0, 0, -6766], [1, 0, -1, 0, -5163], [1, 1, 0, 0, 4987], [2, -1, 1, 0, 4036],
        [2, 0, 2, 0, 3994], [4, 0, 0, 0, 3861], [2, 0, -3, 0, 3665], [0, 1, -2, 0, -2689],
        [2, 0, -1, 2, -2602], [2, -1, -2, 0, 2390], [1, 0, 1, 0, -2348], [2, -2, 0, 0, 2236],
        [0, 1, 2, 0, -2120], [0, 2, 0, 0, -2069], [2, -2, -1, 0, 2048], [2, 0, 1, -2, -1773],
        [2, 0, 0, 2, -1595], [4, -1, -1, 0, 1215], [0, 0, 2, 2, -1110], [3, 0, -1, 0, -892],
        [2, 1, 1, 0, -810], [4, -1, -2, 0, 759], [0, 2, -1, 0, -713], [2, 2, -1, 0, -700],
        [2, 1, -2, 0, 691], [2, -1, 0, -2, 596], [4, 0, 1, 0, 549], [0, 0, 4, 0, 537],
        [4, -1, 0, 0, 520], [1, 0, -2, 0, -487], [2, 1, 0, -2, -399], [0, 0, 2, -2, -381],
        [1, 1, 1, 0, 351], [3, 0, -2, 0, -340], [4, 0, -3, 0, 330], [2, -1, 2, 0, 327],
        [0, 2, 1, 0, -323], [1, 1, -1, 0, 299], [2, 0, 3, 0, 294]
    ];

    function moonApparent(jde) {
        const T = centuries(jde);
        const T2 = T * T, T3 = T2 * T, T4 = T3 * T;
        const Lp = 218.3164477 + 481267.88123421 * T - 0.0015786 * T2 + T3 / 538841 - T4 / 65194000;
        const D = 297.8501921 + 445267.1114034 * T - 0.0018819 * T2 + T3 / 545868 - T4 / 113065000;
        const M = 357.5291092 + 35999.0502909 * T - 0.0001536 * T2 + T3 / 24490000;
        const Mp = 134.9633964 + 477198.8675055 * T + 0.0087414 * T2 + T3 / 69699 - T4 / 14712000;
        const F = 93.2720950 + 483202.0175233 * T - 0.0036539 * T2 - T3 / 3526000 + T4 / 863310000;
        const A1 = 119.75 + 131.849 * T;
        const A2 = 53.09 + 479264.290 * T;
        const E = 1 - 0.002516 * T - 0.0000074 * T2;
        let sl = 0;
        for (const [d, m, mp, f, c] of MOON_TERMS) {
            let term = c * sin(d * D + m * M + mp * Mp + f * F);
            if (m === 1 || m === -1) term *= E;
            else if (m === 2 || m === -2) term *= E * E;
            sl += term;
        }
        sl += 3958 * sin(A1) + 1962 * sin(Lp - F) + 318 * sin(A2);
        const omega = 125.04452 - 1934.136261 * T;
        const dPsi = -0.00478 * sin(omega); // same nutation term applied to the Sun
        return norm360(Lp + sl / 1e6 + dPsi);
    }

    // Lahiri ayanamsa (mean), 23°51'25.5" at J2000 plus general precession.
    function ayanamsa(jde) {
        const T = centuries(jde);
        return 23.857092 + (5029.0966 * T + 1.11113 * T * T) / 3600;
    }

    // ───────────── Angular quantities at a UTC instant ─────────────
    function sunLong(ms) { return sunApparent(jdTT(ms)).lambda; }
    function moonLong(ms) { return moonApparent(jdTT(ms)); }
    function elongation(ms) { return norm360(moonLong(ms) - sunLong(ms)); }
    function siderealSun(ms) { return norm360(sunLong(ms) - ayanamsa(jdTT(ms))); }
    function siderealMoon(ms) { return norm360(moonLong(ms) - ayanamsa(jdTT(ms))); }
    function yogaAngle(ms) { return norm360(siderealSun(ms) + siderealMoon(ms)); }

    // Solve fn(ms) == target (degrees, cyclic) near a starting guess.
    function solve(fn, target, guessMs, ratePerDay) {
        let t = guessMs;
        for (let i = 0; i < 30; i++) {
            const diff = norm180(target - fn(t));
            if (Math.abs(diff) < 1e-6) break;
            const r = norm180(fn(t + HOUR_MS) - fn(t)) * 24 || ratePerDay;
            t += (diff / r) * DAY_MS;
        }
        return t;
    }

    // Span containing ms for an angle divided into equal segments.
    function segmentSpan(fn, ms, seg, ratePerDay) {
        const a = fn(ms);
        const idx = Math.floor(a / seg);
        const startTarget = idx * seg;
        const endTarget = norm360((idx + 1) * seg);
        const start = solve(fn, startTarget, ms - ((a - startTarget) / ratePerDay) * DAY_MS, ratePerDay);
        const end = solve(fn, endTarget, ms + (((idx + 1) * seg - a) / ratePerDay) * DAY_MS, ratePerDay);
        return { index: idx, start, end };
    }

    const tithiAt = (ms) => Math.floor(elongation(ms) / 12);

    // ───────────── Sunrise / sunset ─────────────
    function sunEvent(key, lat, lon, rise) {
        const { y, m, d } = parseKey(key);
        let t = istMidnight(y, m, d) + (rise ? 6 : 18) * HOUR_MS;
        const h0 = -0.8333;
        for (let i = 0; i < 6; i++) {
            const jd = jdUT(t);
            const T = centuries(jd);
            const { lambda, eps } = sunApparent(jdTT(t));
            const alpha = norm360(Math.atan2(cos(eps) * sin(lambda), cos(lambda)) / DEG);
            const delta = Math.asin(sin(eps) * sin(lambda)) / DEG;
            const gmst = norm360(280.46061837 + 360.98564736629 * (jd - 2451545) + 0.000387933 * T * T);
            const H = norm180(gmst + lon - alpha);
            const cosH0 = (sin(h0) - sin(lat) * sin(delta)) / (cos(lat) * cos(delta));
            const H0 = Math.acos(Math.max(-1, Math.min(1, cosH0))) / DEG;
            const dH = norm180((rise ? -H0 : H0) - H);
            t += (dH / 360.98564736629) * DAY_MS;
            if (Math.abs(dH) < 1e-4) break;
        }
        return t;
    }

    // ───────────── Lunar month ─────────────
    const SYNODIC_RATE = 12.1907; // mean elongation deg/day

    function prevNewMoon(ms) {
        const e = elongation(ms);
        return solve(elongation, 0, ms - (e / SYNODIC_RATE) * DAY_MS, SYNODIC_RATE);
    }
    function nextNewMoon(ms) {
        const e = elongation(ms);
        return solve(elongation, 0, ms + ((360 - e) / SYNODIC_RATE) * DAY_MS, SYNODIC_RATE);
    }

    const monthCache = new Map();
    // Amanta month containing instant ms: index 0 = Chaitra … 11 = Phalguna.
    function lunarMonthAt(ms) {
        let nm1 = prevNewMoon(ms);
        if (nm1 > ms) nm1 = prevNewMoon(nm1 - DAY_MS);
        const cacheKey = Math.round(nm1 / 60000);
        if (monthCache.has(cacheKey)) return monthCache.get(cacheKey);
        const nm2 = nextNewMoon(nm1 + 2 * DAY_MS);
        const r1 = Math.floor(siderealSun(nm1) / 30);
        const r2 = Math.floor(siderealSun(nm2) / 30);
        const res = { index: (r1 + 1) % 12, adhik: r1 === r2, start: nm1, end: nm2 };
        monthCache.set(cacheKey, res);
        return res;
    }

    // ───────────── Names ─────────────
    const NAMES = {
        en: {
            tithi: ['Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi', 'Saptami', 'Ashtami',
                'Navami', 'Dashami', 'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima', 'Amavasya'],
            paksha: ['Shukla Paksha', 'Krishna Paksha'],
            pakshaShort: ['Shukla', 'Krishna'],
            nakshatra: ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya',
                'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha',
                'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta',
                'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'],
            yoga: ['Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda', 'Sukarma', 'Dhriti',
                'Shula', 'Ganda', 'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra', 'Siddhi', 'Vyatipata',
                'Variyana', 'Parigha', 'Shiva', 'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma', 'Indra', 'Vaidhriti'],
            karana: ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Garaja', 'Vanija', 'Vishti', 'Shakuni', 'Chatushpada',
                'Naga', 'Kimstughna'],
            month: ['Chaitra', 'Vaishakha', 'Jyeshtha', 'Ashadha', 'Shravana', 'Bhadrapada', 'Ashwin', 'Kartika',
                'Margashirsha', 'Pausha', 'Magha', 'Phalguna'],
            adhik: 'Adhik',
            rashi: ['Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya', 'Tula', 'Vrishchika', 'Dhanu',
                'Makara', 'Kumbha', 'Meena'],
            ritu: ['Vasanta', 'Grishma', 'Varsha', 'Sharad', 'Hemanta', 'Shishira'],
            weekday: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            vara: ['Ravivar', 'Somvar', 'Mangalvar', 'Budhvar', 'Guruvar', 'Shukravar', 'Shanivar']
        },
        hi: {
            tithi: ['प्रतिपदा', 'द्वितीया', 'तृतीया', 'चतुर्थी', 'पंचमी', 'षष्ठी', 'सप्तमी', 'अष्टमी', 'नवमी', 'दशमी',
                'एकादशी', 'द्वादशी', 'त्रयोदशी', 'चतुर्दशी', 'पूर्णिमा', 'अमावस्या'],
            paksha: ['शुक्ल पक्ष', 'कृष्ण पक्ष'],
            pakshaShort: ['शुक्ल', 'कृष्ण'],
            nakshatra: ['अश्विनी', 'भरणी', 'कृत्तिका', 'रोहिणी', 'मृगशिरा', 'आर्द्रा', 'पुनर्वसु', 'पुष्य', 'आश्लेषा',
                'मघा', 'पूर्वा फाल्गुनी', 'उत्तरा फाल्गुनी', 'हस्त', 'चित्रा', 'स्वाती', 'विशाखा', 'अनुराधा', 'ज्येष्ठा',
                'मूल', 'पूर्वाषाढ़ा', 'उत्तराषाढ़ा', 'श्रवण', 'धनिष्ठा', 'शतभिषा', 'पूर्वा भाद्रपद', 'उत्तरा भाद्रपद', 'रेवती'],
            yoga: ['विष्कम्भ', 'प्रीति', 'आयुष्मान', 'सौभाग्य', 'शोभन', 'अतिगण्ड', 'सुकर्मा', 'धृति', 'शूल', 'गण्ड',
                'वृद्धि', 'ध्रुव', 'व्याघात', 'हर्षण', 'वज्र', 'सिद्धि', 'व्यतीपात', 'वरीयान', 'परिघ', 'शिव', 'सिद्ध',
                'साध्य', 'शुभ', 'शुक्ल', 'ब्रह्म', 'इन्द्र', 'वैधृति'],
            karana: ['बव', 'बालव', 'कौलव', 'तैतिल', 'गर', 'वणिज', 'विष्टि', 'शकुनि', 'चतुष्पद', 'नाग', 'किंस्तुघ्न'],
            month: ['चैत्र', 'वैशाख', 'ज्येष्ठ', 'आषाढ़', 'श्रावण', 'भाद्रपद', 'आश्विन', 'कार्तिक', 'मार्गशीर्ष', 'पौष',
                'माघ', 'फाल्गुन'],
            adhik: 'अधिक',
            rashi: ['मेष', 'वृषभ', 'मिथुन', 'कर्क', 'सिंह', 'कन्या', 'तुला', 'वृश्चिक', 'धनु', 'मकर', 'कुंभ', 'मीन'],
            ritu: ['वसंत', 'ग्रीष्म', 'वर्षा', 'शरद', 'हेमंत', 'शिशिर'],
            weekday: ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'],
            vara: ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार']
        }
    };

    // Karana index (0..59 half-tithis) → name index in NAMES.karana
    function karanaName(k) {
        if (k === 0) return 10;            // Kimstughna
        if (k >= 57) return 7 + (k - 57);  // Shakuni, Chatushpada, Naga
        return (k - 1) % 7;
    }

    // Tithi number 0..29 → name index in NAMES.tithi (0..15)
    function tithiName(t) {
        if (t === 14) return 14;
        if (t === 29) return 15;
        return t % 15;
    }

    // ───────────── Cities (IST applies everywhere) ─────────────
    const CITIES = [
        ['New Delhi', 'नई दिल्ली', 28.6139, 77.2090], ['Mumbai', 'मुंबई', 19.0760, 72.8777],
        ['Kolkata', 'कोलकाता', 22.5726, 88.3639], ['Chennai', 'चेन्नई', 13.0827, 80.2707],
        ['Bengaluru', 'बेंगलुरु', 12.9716, 77.5946], ['Hyderabad', 'हैदराबाद', 17.3850, 78.4867],
        ['Ahmedabad', 'अहमदाबाद', 23.0225, 72.5714], ['Pune', 'पुणे', 18.5204, 73.8567],
        ['Jaipur', 'जयपुर', 26.9124, 75.7873], ['Lucknow', 'लखनऊ', 26.8467, 80.9462],
        ['Varanasi', 'वाराणसी', 25.3176, 82.9739], ['Ayodhya', 'अयोध्या', 26.7922, 82.1998],
        ['Mathura', 'मथुरा', 27.4924, 77.6737], ['Haridwar', 'हरिद्वार', 29.9457, 78.1642],
        ['Ujjain', 'उज्जैन', 23.1765, 75.7885], ['Prayagraj', 'प्रयागराज', 25.4358, 81.8463],
        ['Patna', 'पटना', 25.5941, 85.1376], ['Bhopal', 'भोपाल', 23.2599, 77.4126],
        ['Indore', 'इंदौर', 22.7196, 75.8577], ['Nagpur', 'नागपुर', 21.1458, 79.0882],
        ['Chandigarh', 'चंडीगढ़', 30.7333, 76.7794], ['Amritsar', 'अमृतसर', 31.6340, 74.8723],
        ['Dehradun', 'देहरादून', 30.3165, 78.0322], ['Shimla', 'शिमला', 31.1048, 77.1734],
        ['Srinagar', 'श्रीनगर', 34.0837, 74.7973], ['Jammu', 'जम्मू', 32.7266, 74.8570],
        ['Guwahati', 'गुवाहाटी', 26.1445, 91.7362], ['Bhubaneswar', 'भुवनेश्वर', 20.2961, 85.8245],
        ['Puri', 'पुरी', 19.8135, 85.8312], ['Ranchi', 'रांची', 23.3441, 85.3096],
        ['Raipur', 'रायपुर', 21.2514, 81.6296], ['Surat', 'सूरत', 21.1702, 72.8311],
        ['Vadodara', 'वडोदरा', 22.3072, 73.1812], ['Dwarka', 'द्वारका', 22.2394, 68.9678],
        ['Goa (Panaji)', 'गोवा (पणजी)', 15.4909, 73.8278], ['Visakhapatnam', 'विशाखापत्तनम', 17.6868, 83.2185],
        ['Tirupati', 'तिरुपति', 13.6288, 79.4192], ['Madurai', 'मदुरै', 9.9252, 78.1198],
        ['Kochi', 'कोच्चि', 9.9312, 76.2673], ['Thiruvananthapuram', 'तिरुवनंतपुरम', 8.5241, 76.9366],
        ['Rameswaram', 'रामेश्वरम', 9.2876, 79.3129], ['Gangtok', 'गंगटोक', 27.3389, 88.6065],
        ['Imphal', 'इंफाल', 24.8170, 93.9368], ['Port Blair', 'पोर्ट ब्लेयर', 11.6234, 92.7265]
    ].map(([en, hi, lat, lon]) => ({ id: en.toLowerCase().replace(/[^a-z]+/g, '-'), en, hi, lat, lon }));

    // ───────────── Daily panchang ─────────────
    const dayCache = new Map();

    function dayBasics(key, loc) {
        const ck = `${key}|${loc.lat}|${loc.lon}`;
        if (dayCache.has(ck)) return dayCache.get(ck);
        const sunrise = sunEvent(key, loc.lat, loc.lon, true);
        const sunset = sunEvent(key, loc.lat, loc.lon, false);
        const nextSunrise = sunEvent(addDays(key, 1), loc.lat, loc.lon, true);
        const dayLen = sunset - sunrise;
        const times = {
            sunrise,
            madhyahna: sunrise + dayLen * 0.5,
            aparahna: sunrise + dayLen * 0.6, // start of the 4th fifth of daytime
            sunset,
            pradosh: sunset + 72 * 60000,
            nishita: sunset + (nextSunrise - sunset) / 2
        };
        const tithi = {};
        const month = {};
        for (const k of Object.keys(times)) {
            tithi[k] = tithiAt(times[k]);
            month[k] = lunarMonthAt(times[k]);
        }
        const res = { key, sunrise, sunset, nextSunrise, times, tithi, month };
        dayCache.set(ck, res);
        if (dayCache.size > 4000) dayCache.delete(dayCache.keys().next().value);
        return res;
    }

    // Shaka / Vikram Samvat for an amanta month index and IST civil date
    function samvat(key, monthIdx) {
        const { y, m } = parseKey(key);
        const shaka = (monthIdx >= 9 && m <= 5) ? y - 79 : y - 78;
        return { shaka, vikram: shaka + 135 };
    }

    // Split daytime into 8 parts; index by weekday
    const RAHU_PART = [7, 1, 6, 4, 5, 3, 2];
    const YAMA_PART = [4, 3, 2, 1, 0, 6, 5];
    const GULIKA_PART = [6, 5, 4, 3, 2, 1, 0];

    function daily(key, loc) {
        const b = dayBasics(key, loc);
        const sr = b.sunrise;
        const wd = weekday(key);
        const part = (b.sunset - sr) / 8;
        const slot = (i) => ({ start: sr + i * part, end: sr + (i + 1) * part });

        const tithi = segmentSpan(elongation, sr, 12, SYNODIC_RATE);
        const nak = segmentSpan(siderealMoon, sr, 360 / 27, 13.176);
        const yoga = segmentSpan(yogaAngle, sr, 360 / 27, 13.23);
        const kar = segmentSpan(elongation, sr, 6, SYNODIC_RATE);
        const month = b.month.sunrise;
        const t = tithi.index;
        const paksha = t < 15 ? 0 : 1;
        const purnimantaIdx = paksha === 1 ? (month.index + 1) % 12 : month.index;
        // New year starts on the day Chaitra Shukla Pratipada is observed, even if Amavasya held at sunrise.
        const newYear = observed(key, loc, 0, 'sunrise');
        const sv = samvat(key, newYear && newYear.index === 0 && !newYear.adhik ? 0 : month.index);
        const muhurta = (b.sunset - sr) / 15;
        const noon = sr + (b.sunset - sr) / 2;
        const elong = elongation(sr);

        return {
            key,
            weekday: wd,
            sunrise: sr,
            sunset: b.sunset,
            tithi: { num: t, name: tithiName(t), start: tithi.start, end: tithi.end },
            // second tithi of the day, if the first ends before next sunrise
            nextTithi: tithi.end < b.nextSunrise ? { num: (t + 1) % 30, name: tithiName((t + 1) % 30) } : null,
            paksha,
            nakshatra: { index: nak.index, start: nak.start, end: nak.end },
            yoga: { index: yoga.index, end: yoga.end },
            karana: { index: karanaName(kar.index), end: kar.end },
            month: { amanta: month.index, purnimanta: purnimantaIdx, adhik: month.adhik },
            ritu: Math.floor(month.index / 2),
            sunRashi: Math.floor(siderealSun(sr) / 30),
            moonRashi: Math.floor(siderealMoon(sr) / 30),
            samvat: sv,
            moonPhase: { elongation: elong, illumination: (1 - cos(elong)) / 2 },
            rahuKaal: slot(RAHU_PART[wd]),
            yamaganda: slot(YAMA_PART[wd]),
            gulika: slot(GULIKA_PART[wd]),
            abhijit: wd === 3 ? null : { start: noon - muhurta / 2, end: noon + muhurta / 2 },
            brahmaMuhurta: { start: sr - 96 * 60000, end: sr - 48 * 60000 }
        };
    }

    // ───────────── Festivals & vrats ─────────────
    // m = amanta month index, t = tithi 0..29, at = time-of-day rule
    const FESTIVALS = [
        { id: 'vasant-panchami', m: 10, t: 4, at: 'sunrise', en: 'Vasant Panchami', hi: 'वसंत पंचमी' },
        { id: 'maha-shivaratri', m: 10, t: 28, at: 'nishita', en: 'Maha Shivaratri', hi: 'महाशिवरात्रि' },
        { id: 'holika-dahan', m: 11, t: 14, at: 'pradosh', en: 'Holika Dahan', hi: 'होलिका दहन' },
        { id: 'gudi-padwa', m: 0, t: 0, at: 'sunrise', en: 'Chaitra Navratri · Ugadi · Gudi Padwa', hi: 'चैत्र नवरात्रि · उगादी · गुड़ी पड़वा' },
        { id: 'ram-navami', m: 0, t: 8, at: 'madhyahna', en: 'Ram Navami', hi: 'राम नवमी' },
        { id: 'hanuman-jayanti', m: 0, t: 14, at: 'sunrise', en: 'Hanuman Jayanti', hi: 'हनुमान जयंती' },
        { id: 'akshaya-tritiya', m: 1, t: 2, at: 'madhyahna', en: 'Akshaya Tritiya', hi: 'अक्षय तृतीया' },
        { id: 'buddha-purnima', m: 1, t: 14, at: 'sunrise', en: 'Buddha Purnima', hi: 'बुद्ध पूर्णिमा' },
        { id: 'vat-savitri', m: 1, t: 29, at: 'madhyahna', en: 'Vat Savitri Vrat', hi: 'वट सावित्री व्रत' },
        { id: 'ganga-dussehra', m: 2, t: 9, at: 'sunrise', allowAdhik: true, en: 'Ganga Dussehra', hi: 'गंगा दशहरा' },
        { id: 'rath-yatra', m: 3, t: 1, at: 'sunrise', en: 'Jagannath Rath Yatra', hi: 'जगन्नाथ रथ यात्रा' },
        { id: 'guru-purnima', m: 3, t: 14, at: 'sunrise', en: 'Guru Purnima', hi: 'गुरु पूर्णिमा' },
        { id: 'hariyali-teej', m: 4, t: 2, at: 'sunrise', en: 'Hariyali Teej', hi: 'हरियाली तीज' },
        { id: 'nag-panchami', m: 4, t: 4, at: 'sunrise', en: 'Nag Panchami', hi: 'नाग पंचमी' },
        { id: 'raksha-bandhan', m: 4, t: 14, at: 'sunrise', en: 'Raksha Bandhan', hi: 'रक्षा बंधन' },
        { id: 'janmashtami', m: 4, t: 22, at: 'sunrise', en: 'Krishna Janmashtami', hi: 'कृष्ण जन्माष्टमी' },
        { id: 'hartalika-teej', m: 5, t: 2, at: 'sunrise', en: 'Hartalika Teej', hi: 'हरतालिका तीज' },
        { id: 'ganesh-chaturthi', m: 5, t: 3, at: 'madhyahna', en: 'Ganesh Chaturthi', hi: 'गणेश चतुर्थी' },
        { id: 'anant-chaturdashi', m: 5, t: 13, at: 'sunrise', en: 'Anant Chaturdashi', hi: 'अनंत चतुर्दशी' },
        { id: 'mahalaya', m: 5, t: 29, at: 'sunrise', en: 'Sarva Pitru Amavasya', hi: 'सर्व पितृ अमावस्या' },
        { id: 'sharad-navratri', m: 6, t: 0, at: 'sunrise', en: 'Sharad Navratri begins', hi: 'शारदीय नवरात्रि आरंभ' },
        { id: 'durga-ashtami', m: 6, t: 7, at: 'sunrise', en: 'Durga Ashtami', hi: 'दुर्गा अष्टमी' },
        { id: 'maha-navami', m: 6, t: 8, at: 'sunrise', en: 'Maha Navami', hi: 'महा नवमी' },
        { id: 'dussehra', m: 6, t: 9, at: 'aparahna', en: 'Dussehra · Vijayadashami', hi: 'दशहरा · विजयादशमी' },
        { id: 'sharad-purnima', m: 6, t: 14, at: 'pradosh', en: 'Sharad Purnima', hi: 'शरद पूर्णिमा' },
        { id: 'karva-chauth', m: 6, t: 18, at: 'sunrise', en: 'Karva Chauth', hi: 'करवा चौथ' },
        { id: 'ahoi-ashtami', m: 6, t: 22, at: 'pradosh', en: 'Ahoi Ashtami', hi: 'अहोई अष्टमी' },
        { id: 'dhanteras', m: 6, t: 27, at: 'pradosh', en: 'Dhanteras', hi: 'धनतेरस' },
        { id: 'diwali', m: 6, t: 29, at: 'pradosh', en: 'Diwali · Lakshmi Puja', hi: 'दीपावली · लक्ष्मी पूजा' },
        { id: 'govardhan', m: 7, t: 0, at: 'sunrise', en: 'Govardhan Puja', hi: 'गोवर्धन पूजा' },
        { id: 'bhai-dooj', m: 7, t: 1, at: 'aparahna', en: 'Bhai Dooj', hi: 'भाई दूज' },
        { id: 'chhath', m: 7, t: 5, at: 'sunset', en: 'Chhath Puja', hi: 'छठ पूजा' },
        { id: 'kartik-purnima', m: 7, t: 14, at: 'sunrise', en: 'Kartik Purnima · Dev Deepawali', hi: 'कार्तिक पूर्णिमा · देव दीपावली' },
        { id: 'vivah-panchami', m: 8, t: 4, at: 'sunrise', en: 'Vivah Panchami', hi: 'विवाह पंचमी' },
        { id: 'dattatreya-jayanti', m: 8, t: 14, at: 'pradosh', en: 'Dattatreya Jayanti', hi: 'दत्तात्रेय जयंती' }
    ];

    // Days relative to another festival
    const DERIVED = [
        { id: 'holi', from: 'holika-dahan', offset: 1, en: 'Holi', hi: 'होली' },
        { id: 'choti-diwali', from: 'diwali', offset: -1, en: 'Narak Chaturdashi · Choti Diwali', hi: 'नरक चतुर्दशी · छोटी दिवाली' },
        { id: 'lohri', from: 'makar-sankranti', offset: -1, en: 'Lohri', hi: 'लोहड़ी' }
    ];

    // Sidereal sign ingress (Sankranti)
    const SANKRANTI_FEST = {
        9: { id: 'makar-sankranti', en: 'Makar Sankranti · Pongal', hi: 'मकर संक्रांति · पोंगल' },
        0: { id: 'baisakhi', en: 'Baisakhi · Mesha Sankranti', hi: 'बैसाखी · मेष संक्रांति' }
    };

    // Gregorian national days
    const FIXED = [
        { md: '01-26', id: 'republic-day', en: 'Republic Day', hi: 'गणतंत्र दिवस' },
        { md: '08-15', id: 'independence-day', en: 'Independence Day', hi: 'स्वतंत्रता दिवस' },
        { md: '10-02', id: 'gandhi-jayanti', en: 'Gandhi Jayanti', hi: 'गांधी जयंती' }
    ];

    const EKADASHI = {
        shukla: {
            en: ['Kamada', 'Mohini', 'Nirjala', 'Devshayani', 'Shravana Putrada', 'Parivartini', 'Papankusha',
                'Devutthana', 'Mokshada', 'Pausha Putrada', 'Jaya', 'Amalaki'],
            hi: ['कामदा', 'मोहिनी', 'निर्जला', 'देवशयनी', 'श्रावण पुत्रदा', 'परिवर्तिनी', 'पापांकुशा', 'देवउठनी',
                'मोक्षदा', 'पौष पुत्रदा', 'जया', 'आमलकी']
        },
        krishna: {
            en: ['Varuthini', 'Apara', 'Yogini', 'Kamika', 'Aja', 'Indira', 'Rama', 'Utpanna', 'Saphala', 'Shattila',
                'Vijaya', 'Papmochani'],
            hi: ['वरूथिनी', 'अपरा', 'योगिनी', 'कामिका', 'अजा', 'इंदिरा', 'रमा', 'उत्पन्ना', 'सफला', 'षटतिला', 'विजया',
                'पापमोचनी']
        },
        adhik: { en: ['Padmini', 'Parama'], hi: ['पद्मिनी', 'परमा'] }
    };

    const VRATS = [
        { t: 3, at: 'madhyahna', id: 'vinayaka-chaturthi', en: 'Vinayaka Chaturthi', hi: 'विनायक चतुर्थी' },
        { t: 18, at: 'sunrise', id: 'sankashti', en: 'Sankashti Chaturthi', hi: 'संकष्टी चतुर्थी' },
        { t: 10, at: 'sunrise', id: 'ekadashi' },
        { t: 25, at: 'sunrise', id: 'ekadashi' },
        { t: 12, at: 'pradosh', id: 'pradosh', en: 'Pradosh Vrat', hi: 'प्रदोष व्रत' },
        { t: 27, at: 'pradosh', id: 'pradosh', en: 'Pradosh Vrat', hi: 'प्रदोष व्रत' },
        { t: 28, at: 'nishita', id: 'masik-shivaratri', en: 'Masik Shivaratri', hi: 'मासिक शिवरात्रि' },
        { t: 14, at: 'sunrise', id: 'purnima', en: 'Purnima', hi: 'पूर्णिमा' },
        { t: 29, at: 'sunrise', id: 'amavasya', en: 'Amavasya', hi: 'अमावस्या' }
    ];

    // Is tithi X observed on day `key` under time rule `at`? Returns the month record or null.
    function observed(key, loc, X, at) {
        const cur = dayBasics(key, loc);
        const prev = dayBasics(addDays(key, -1), loc);
        const Xm = (X + 29) % 30, Xp = (X + 1) % 30;
        if (cur.tithi[at] === X && prev.tithi[at] !== X) return cur.month[at];
        if (at === 'sunrise') {
            // Kshaya tithi (never touches a sunrise) belongs to the day it runs in.
            const next = dayBasics(addDays(key, 1), loc);
            if (cur.tithi.sunrise === Xm && next.tithi.sunrise === Xp) return X === 0 ? next.month.sunrise : cur.month.sunrise;
        } else if (prev.tithi[at] === Xm && cur.tithi[at] === Xp) {
            return X === 0 ? cur.month[at] : prev.month[at];
        }
        return null;
    }

    // Phalguna Purnima at pradosh, unless Bhadra (Vishti karana) lasts past midnight — then next evening.
    function holikaCandidate(key, loc) {
        const mo = observed(key, loc, 14, 'pradosh');
        return !!(mo && mo.index === 11 && !mo.adhik);
    }
    function bhadraPastMidnight(key, loc) {
        const b = dayBasics(key, loc);
        const k = segmentSpan(elongation, b.times.pradosh, 6, SYNODIC_RATE);
        return karanaName(k.index) === 6 && k.end > b.times.nishita;
    }
    function isHolikaDahan(key, loc) {
        const prev = addDays(key, -1);
        if (holikaCandidate(prev, loc) && bhadraPastMidnight(prev, loc)) return true;
        return holikaCandidate(key, loc) && !bhadraPastMidnight(key, loc);
    }

    function sankrantiOn(key, loc) {
        const b = dayBasics(key, loc);
        const prevB = dayBasics(addDays(key, -1), loc);
        // Sankranti moment between (previous day's sunset, this day's sunset] belongs to this day.
        const s0 = Math.floor(siderealSun(prevB.sunset) / 30);
        const s1 = Math.floor(siderealSun(b.sunset) / 30);
        if (s0 === s1) return null;
        const time = solve(siderealSun, s1 * 30, prevB.sunset, 0.9856);
        return { rashi: s1, time };
    }

    function rawEvents(key, loc) {
        const out = [];
        for (const f of FESTIVALS) {
            if (f.id === 'holika-dahan') continue;
            const mo = observed(key, loc, f.t, f.at);
            if (!mo || mo.index !== f.m) continue;
            if (mo.adhik && !f.allowAdhik) continue;
            // Festivals kept in an adhik month are not repeated in the following nija month.
            if (f.allowAdhik && !mo.adhik && lunarMonthAt(mo.start - DAY_MS).adhik) continue;
            out.push({ id: f.id, type: 'festival', en: f.en, hi: f.hi });
        }
        if (isHolikaDahan(key, loc)) out.push({ id: 'holika-dahan', type: 'festival', en: 'Holika Dahan', hi: 'होलिका दहन' });
        const sk = sankrantiOn(key, loc);
        if (sk) {
            const special = SANKRANTI_FEST[sk.rashi];
            const rn = NAMES.en.rashi[sk.rashi], rh = NAMES.hi.rashi[sk.rashi];
            if (special) out.push({ id: special.id, type: 'festival', en: special.en, hi: special.hi, time: sk.time });
            else out.push({ id: 'sankranti', type: 'sankranti', en: `${rn} Sankranti`, hi: `${rh} संक्रांति`, time: sk.time });
        }
        const md = key.slice(5);
        for (const f of FIXED) if (f.md === md) out.push({ id: f.id, type: 'national', en: f.en, hi: f.hi });
        for (const v of VRATS) {
            const mo = observed(key, loc, v.t, v.at);
            if (!mo) continue;
            if (v.id === 'ekadashi') {
                const shukla = v.t === 10;
                let en, hi;
                if (mo.adhik) { en = EKADASHI.adhik.en[shukla ? 0 : 1]; hi = EKADASHI.adhik.hi[shukla ? 0 : 1]; }
                else {
                    const tbl = shukla ? EKADASHI.shukla : EKADASHI.krishna;
                    en = tbl.en[mo.index]; hi = tbl.hi[mo.index];
                }
                out.push({ id: 'ekadashi', type: 'vrat', en: `${en} Ekadashi`, hi: `${hi} एकादशी` });
            } else {
                out.push({ id: v.id, type: 'vrat', en: v.en, hi: v.hi });
            }
        }
        return out;
    }

    function events(key, loc) {
        const out = rawEvents(key, loc);
        for (const d of DERIVED) {
            const srcKey = addDays(key, -d.offset);
            if (rawEvents(srcKey, loc).some((e) => e.id === d.from)) out.push({ id: d.id, type: 'festival', en: d.en, hi: d.hi });
        }
        // Drop generic vrats already covered by a named festival on the same day
        const has = (id) => out.some((e) => e.id === id);
        return out.filter((e) => {
            if (e.id === 'amavasya' && (has('diwali') || has('mahalaya') || has('vat-savitri'))) return false;
            if (e.id === 'purnima' && out.some((x) => x.type === 'festival' && /purnima|raksha|holika|jayanti/.test(x.id))) return false;
            if (e.id === 'masik-shivaratri' && has('maha-shivaratri')) return false;
            if (e.id === 'sankashti' && has('karva-chauth')) return false;
            if (e.id === 'vinayaka-chaturthi' && has('ganesh-chaturthi')) return false;
            return true;
        });
    }

    function upcoming(fromKey, loc, count = 5, maxDays = 120, types = ['festival', 'national', 'vrat', 'sankranti']) {
        const res = [];
        for (let i = 1; i <= maxDays && res.length < count; i++) {
            const k = addDays(fromKey, i);
            for (const e of events(k, loc)) {
                if (types.includes(e.type)) { res.push({ key: k, ...e }); if (res.length >= count) break; }
            }
        }
        return res;
    }

    return {
        NAMES, CITIES, EKADASHI,
        daily, events, upcoming,
        todayKey, addDays, parseKey, keyOf, weekday, formatTime,
        // exposed for tests
        _internal: { sunLong, moonLong, elongation, siderealSun, siderealMoon, ayanamsa, jdTT, sunEvent, lunarMonthAt, tithiAt, istMidnight }
    };
});
