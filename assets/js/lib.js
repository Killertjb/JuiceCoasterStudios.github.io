/* Shared helpers used by every page. Exposes window.JCS.
   Each page sets <body data-root="..."> to the relative path back to the site root
   (for example "../../" inside artists/nhs/), so the site works on any URL or sub-path. */
(function () {
    'use strict';

    const root = document.body.dataset.root || './';
    const debug = /[?&]debug\b/.test(location.search) || ['localhost', '127.0.0.1'].includes(location.hostname);
    const problems = [];

    /* ---- Data loading ------------------------------------------------------ */

    // Fetch a JSON file. With { optional: true } a missing file (404) returns null quietly,
    // which lets a listing simply leave out files it doesn't need.
    async function getJSON(path, opts) {
        const optional = !!(opts && opts.optional);
        let res;
        try {
            res = await fetch(path, { cache: 'no-cache' });
        } catch (err) {
            problems.push('Could not load ' + path + (location.protocol === 'file:'
                ? ' (open the site through a web server or GitHub Pages instead of double-clicking the file)' : ''));
            if (optional) return null;
            throw err;
        }
        if (!res.ok) {
            if (!(optional && res.status === 404)) problems.push(path + ': HTTP ' + res.status);
            if (optional) return null;
            throw new Error(path + ': HTTP ' + res.status);
        }
        try {
            return await res.json();
        } catch (err) {
            problems.push(path + ' has a typo (invalid JSON): ' + err.message);
            console.error(path, err);
            if (optional) return null;
            throw err;
        }
    }

    let platformsPromise;
    // data/platforms.json: label, icon and colour for each streaming / social platform key.
    function loadPlatforms() {
        platformsPromise = platformsPromise || getJSON(root + 'data/platforms.json', { optional: true }).then(d => {
            const map = (d && d.platforms) || {};
            return { map, order: Object.keys(map) };
        });
        return platformsPromise;
    }

    /* ---- DOM + formatting helpers ----------------------------------------- */

    // Tiny element builder. Uses textContent, so data from the JSON files can never inject HTML.
    function el(tag, attrs, ...kids) {
        const node = document.createElement(tag);
        for (const [key, value] of Object.entries(attrs || {})) {
            if (value == null || value === false) continue;
            if (key === 'class') node.className = value;
            else if (key === 'text') node.textContent = value;
            else node.setAttribute(key, value === true ? '' : value);
        }
        for (const kid of kids.flat(Infinity)) {
            if (kid == null || kid === false || kid === '') continue;
            node.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
        }
        return node;
    }

    // Accepts full links, "mailto:", "tel:" and site-relative paths; adds https:// to bare domains;
    // rejects anything unsafe such as "javascript:".
    function normalizeUrl(url) {
        if (typeof url !== 'string') return '';
        const u = url.trim();
        if (!u) return '';
        if (/^(https?:|mailto:|tel:)/i.test(u)) return u;
        if (/^(javascript|data|vbscript):/i.test(u)) return '';
        if (/^(\.{0,2}\/|#|[\w-]+\/|[\w.-]+\.(html?|pdf|md|png|jpe?g|svg|webp|mp4)$)/i.test(u)) return u;
        return 'https://' + u;
    }

    // Turns { spotify: "url", youtube: "" } into a list of visible buttons, ordered as in platforms.json.
    function platformLinks(links, platforms) {
        const out = [];
        for (const [key, raw] of Object.entries(links || {})) {
            const url = normalizeUrl(raw);
            if (!url) continue;
            const info = platforms.map[key] || {};
            out.push({ key, url, label: info.label || key, icon: info.icon || '🔗', color: info.color || '', kind: info.kind || 'other' });
        }
        const rank = key => { const i = platforms.order.indexOf(key); return i === -1 ? 999 : i; };
        return out.sort((a, b) => rank(a.key) - rank(b.key));
    }

    function parseDate(value) {
        if (!value) return null;
        const s = String(value);
        const d = new Date(/^\d{4}-\d{2}-\d{2}$/.test(s) ? s + 'T00:00:00' : s);
        return isNaN(d) ? null : d;
    }

    function formatDate(value) {
        const d = parseDate(value);
        return d ? d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : String(value || '');
    }

    function hueFrom(str) {
        let h = 0;
        for (const ch of String(str)) h = (h * 31 + ch.charCodeAt(0)) % 360;
        return h;
    }

    const digits = v => String(v || '').replace(/[^\d]/g, '');
    const telHref = phone => 'tel:+' + digits(phone).replace(/^0+/, '');
    const waHref = number => 'https://wa.me/' + digits(number);
    const text = v => (typeof v === 'string' ? v.trim() : '');
    const list = (data, key) => (data && Array.isArray(data[key]) ? data[key] : []);

    /* ---- Messages ---------------------------------------------------------- */

    function errorBox(message) {
        return el('div', { class: 'notice', role: 'alert' }, message,
            location.protocol === 'file:' ? ' Open the site through a web server or GitHub Pages; double-clicking the HTML file will not work.' : '');
    }

    // Shows data typos on screen while testing locally (or with ?debug in the address).
    function showProblems() {
        if (!debug || !problems.length) return;
        document.body.prepend(el('div', { class: 'notice', role: 'alert' }, el('strong', { text: 'Site data problems: ' }), problems.join(' • ')));
    }

    window.JCS = { root, el, getJSON, loadPlatforms, platformLinks, normalizeUrl, parseDate, formatDate,
        hueFrom, telHref, waHref, text, list, errorBox, showProblems };
})();
