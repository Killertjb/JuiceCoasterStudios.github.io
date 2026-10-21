/* Artist and service pages.
   Every listing folder has the same small index.html that loads this file. This script reads the
   JSON files sitting next to that page (profile.json, releases.json, contact/contact.json, ...)
   and builds the page. A section only appears when its file has content, so a brand-new listing
   shows just what has been filled in so far. */
(async function () {
    'use strict';
    const J = window.JCS;
    const { root, el, getJSON, text, list, normalizeUrl, formatDate, parseDate } = J;

    const app = document.getElementById('app');
    const type = document.body.dataset.type === 'service' ? 'service' : 'artist';
    const opt = path => getJSON(path, { optional: true });

    /* ---- Load data --------------------------------------------------------- */

    let profile;
    try {
        profile = await getJSON('profile.json');
    } catch (err) {
        app.replaceChildren(J.errorBox("This page's profile.json could not be loaded."));
        J.showProblems();
        return;
    }

    const [siteData, platforms, contactData, policiesData, testimonialsData, fileA, fileB, fileC] = await Promise.all([
        opt(root + 'data/site.json'), J.loadPlatforms(), opt('contact/contact.json'), opt('policies/policies.json'), opt('testimonials.json'),
        ...(type === 'artist'
            ? [opt('releases.json'), opt('videos.json'), opt('events.json')]
            : [opt('offerings.json'), opt('gallery.json'), opt('process.json')])
    ]);
    const site = siteData || {};
    const siteName = text(site.name) || 'Just For Entertainment Society';
    const shortName = text(site.shortName) || siteName;   // back button
    const name = text(profile.name) || 'Untitled';

    /* ---- Page-level settings ---------------------------------------------- */

    document.title = name + ' | ' + siteName;
    const description = text(profile.summary) || text(profile.tagline);
    if (description) {
        let meta = document.querySelector('meta[name="description"]');
        if (!meta) { meta = el('meta', { name: 'description' }); document.head.append(meta); }
        meta.setAttribute('content', description);
    }
    const theme = profile.theme || {};
    document.body.dataset.theme = theme.mode || (type === 'artist' ? 'dark' : 'light');
    if (text(theme.accent)) document.documentElement.style.setProperty('--accent', theme.accent);

    // Social / streaming profile links: this listing's own links, plus the studio's for studio-run services.
    const contactInfo = Object.assign({}, contactData || {});
    if (contactInfo.useSiteContact && site.contact) {
        for (const [key, value] of Object.entries(site.contact)) if (!text(contactInfo[key]) && value) contactInfo[key] = value;
    }
    const allLinks = Object.assign({}, contactInfo.useSiteContact ? site.links : {});
    for (const [key, value] of Object.entries(profile.links || {})) if (text(value)) allLinks[key] = value;
    const profileLinks = J.platformLinks(allLinks, platforms);

    const section = (id, title, subtitle, body) => el('section', { id, class: 'section' },
        el('div', { class: 'container' },
            title && el('h2', { class: 'section-title', text: title }),
            subtitle && el('p', { class: 'section-subtitle', text: subtitle }),
            body));

    const newTab = { target: '_blank', rel: 'noopener noreferrer' };

    /* ---- Sections ---------------------------------------------------------- */

    function aboutSection() {
        const bio = [].concat(profile.bio || []).map(text).filter(Boolean);
        const genres = list(profile, 'genres').map(text).filter(Boolean);
        const stats = list(profile, 'highlights').filter(h => text(h.value) || text(h.label));
        const pillars = list(profile, 'pillars').filter(p => text(p.title));
        if (!bio.length && !stats.length && !pillars.length && !genres.length) return null;
        return section('about', text(profile.bioTitle) || 'About ' + name, '', [
            bio.length > 0 && el('div', { class: 'about-text' }, bio.map(p => el('p', { text: p }))),
            genres.length > 0 && el('ul', { class: 'chips' }, genres.map(g => el('li', { text: g }))),
            stats.length > 0 && el('div', { class: 'stats' }, stats.map(s =>
                el('div', { class: 'stat' }, el('strong', { text: s.value }), el('span', { text: s.label })))),
            pillars.length > 0 && el('div', { class: 'pillars' }, pillars.map(p =>
                el('div', { class: 'pillar' }, p.icon && el('span', { class: 'pillar-icon', 'aria-hidden': 'true', text: p.icon }),
                    el('h3', { text: p.title }), el('p', { text: text(p.text) }))))
        ]);
    }

    /* Releases: cover art (click = open on the main platform) + one button per platform. */
    const TYPE_LABEL = { single: 'Single', ep: 'EP', album: 'Album', compilation: 'Compilation', remix: 'Remix', live: 'Live' };
    const TYPE_PLURAL = { single: 'Singles', ep: 'EPs', album: 'Albums', compilation: 'Compilations', remix: 'Remixes', live: 'Live' };
    const kindOf = r => String(r.type || 'single').toLowerCase();

    function releaseCard(r) {
        const title = text(r.title);
        const links = J.platformLinks(r.links, platforms);
        const primary = links.find(l => l.key === r.primary) || links[0];
        const when = parseDate(r.releaseDate);
        const year = when ? when.getFullYear() : text(String(r.year || ''));
        const upcoming = when && when > new Date();

        const placeholder = () => el('div', { class: 'cover-placeholder', style: '--hue:' + J.hueFrom(title), 'aria-hidden': 'true' },
            el('span', { text: r.icon || '♪' }));
        let art = placeholder();
        if (text(r.cover)) {
            const img = el('img', { src: r.cover, alt: 'Cover art for ' + title, loading: 'lazy' });
            img.addEventListener('error', () => img.replaceWith(placeholder()));
            art = img;
        }
        const cover = primary
            ? el('a', Object.assign({ class: 'cover', href: primary.url, 'aria-label': 'Listen to ' + title + ' on ' + primary.label }, newTab),
                art, el('span', { class: 'cover-hint', text: 'Play on ' + primary.label }))
            : el('div', { class: 'cover' }, art, upcoming && el('span', { class: 'badge', text: 'Coming soon' }));

        const tracks = list(r, 'tracks').filter(t => text(t.title));
        return el('article', { class: 'release' },
            cover,
            el('div', { class: 'release-body' },
                el('h3', { class: 'release-title', text: title }),
                el('p', { class: 'release-meta', text: [TYPE_LABEL[kindOf(r)] || kindOf(r), year, text(r.genre)].filter(Boolean).join(' · ') }),
                links.length > 0 && el('div', { class: 'platform-btns' }, links.map(l =>
                    el('a', Object.assign({ class: 'platform-btn', href: l.url, style: l.color ? '--pcolor:' + l.color : null }, newTab),
                        el('span', { 'aria-hidden': 'true', text: l.icon }), ' ', l.label))),
                tracks.length > 0 && el('details', { class: 'tracklist' },
                    el('summary', { text: 'Tracklist (' + tracks.length + ')' }),
                    el('ol', {}, tracks.map(t => el('li', {}, text(t.title),
                        J.platformLinks(t.links, platforms).map(l => el('a', Object.assign({ class: 'track-link', href: l.url, text: l.label }, newTab)))))))));
    }

    function releasesSection() {
        const items = list(fileA, 'releases').filter(r => text(r.title));
        if (!items.length) return null;
        items.sort((a, b) => String(b.releaseDate || b.year || '').localeCompare(String(a.releaseDate || a.year || '')));

        const grid = el('div', { class: 'release-grid' });
        const filters = el('div', { class: 'filters', role: 'group', 'aria-label': 'Filter releases' });
        const render = kind => grid.replaceChildren(...items.filter(r => kind === 'all' || kindOf(r) === kind).map(releaseCard));

        const order = ['album', 'ep', 'single', 'compilation', 'remix', 'live'];
        const present = [...new Set(items.map(kindOf))].sort((a, b) => (order.indexOf(a) + 99) % 99 - (order.indexOf(b) + 99) % 99);
        if (present.length > 1) {
            [['all', 'All'], ...present.map(k => [k, TYPE_PLURAL[k] || k])].forEach(([kind, label], i) => {
                const btn = el('button', { type: 'button', class: 'filter-btn' + (i === 0 ? ' active' : ''), 'aria-pressed': String(i === 0), text: label });
                btn.addEventListener('click', () => {
                    filters.querySelectorAll('.filter-btn').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
                    btn.classList.add('active');
                    btn.setAttribute('aria-pressed', 'true');
                    render(kind);
                });
                filters.append(btn);
            });
        }
        render('all');
        return section('releases', 'Music', 'Tap a cover or pick your platform to listen', [filters.children.length > 0 && filters, grid]);
    }

    function videosSection() {
        const items = list(fileB, 'videos').filter(v => text(v.title));
        if (!items.length) return null;
        return section('videos', 'Videos', '', el('div', { class: 'video-grid' }, items.map(v => {
            const url = normalizeUrl(v.url) || (text(v.youtubeId) ? 'https://www.youtube.com/watch?v=' + v.youtubeId : '');
            const thumb = text(v.thumbnail) || (text(v.youtubeId) ? 'https://i.ytimg.com/vi/' + v.youtubeId + '/hqdefault.jpg' : '');
            const body = [
                el('div', { class: 'video-thumb' }, thumb && el('img', { src: thumb, alt: '', loading: 'lazy' }), el('span', { class: 'play-icon', 'aria-hidden': 'true', text: '▶' })),
                el('div', { class: 'video-info' }, el('h3', { text: v.title }), text(v.note) && el('p', { text: v.note }))
            ];
            return url ? el('a', Object.assign({ class: 'video-card', href: url }, newTab), body) : el('div', { class: 'video-card' }, body);
        })));
    }

    function eventsSection() {
        const items = list(fileC, 'events').filter(e => text(e.title));
        if (!items.length) return null;
        const today = new Date().setHours(0, 0, 0, 0);
        const isUpcoming = e => { const d = parseDate(e.date); return d && d >= today; };
        const time = e => { const d = parseDate(e.date); return d ? d.getTime() : 0; };
        items.sort((a, b) => (isUpcoming(b) ? 1 : 0) - (isUpcoming(a) ? 1 : 0) || (isUpcoming(a) ? time(a) - time(b) : time(b) - time(a)));
        return section('events', 'Live & Events', '', el('div', { class: 'event-grid' }, items.map(e => {
            const link = e.link && normalizeUrl(e.link.url);
            return el('article', { class: 'event-card' },
                el('span', { class: 'badge' + (isUpcoming(e) ? ' badge-hot' : ''), text: isUpcoming(e) ? 'Upcoming' : (text(e.kind) || 'Past event') }),
                el('h3', { text: e.title }),
                text(e.date) && el('p', { class: 'event-meta', text: '📅 ' + formatDate(e.date) }),
                text(e.location) && el('p', { class: 'event-meta', text: '📍 ' + e.location }),
                link && el('a', Object.assign({ class: 'event-link', href: link, text: (text(e.link.label) || 'More info') + ' →' }, newTab)));
        })));
    }

    function offeringsSection() {
        const items = list(fileA, 'offerings').filter(o => text(o.title));
        if (!items.length) return null;
        return section('services', 'What We Offer', '', el('div', { class: 'offering-grid' }, items.map(o => {
            const link = o.link && normalizeUrl(o.link.url);
            return el('article', { class: 'offering' },
                text(o.image) ? el('img', { class: 'offering-image', src: o.image, alt: '', loading: 'lazy' })
                              : el('div', { class: 'offering-icon', 'aria-hidden': 'true', text: o.icon || '✨' }),
                el('h3', { text: o.title }),
                text(o.description) && el('p', { text: o.description }),
                text(o.price) && el('p', { class: 'offering-price', text: o.price }),
                link && el('a', Object.assign({ class: 'event-link', href: link, text: (text(o.link.label) || 'Learn more') + ' →' }, newTab)));
        })));
    }

    function gallerySection() {
        const items = list(fileB, 'images').filter(i => text(i.image));
        if (!items.length) return null;
        return section('gallery', text(fileB.title) || 'Our Work', '', el('div', { class: 'gallery-grid' }, items.map(i =>
            el('figure', { class: 'gallery-item' },
                el('img', { src: i.image, alt: text(i.alt) || text(i.caption), loading: 'lazy' }),
                text(i.caption) && el('figcaption', { text: i.caption })))));
    }

    function processSection() {
        const steps = list(fileC, 'steps').filter(s => text(s.title));
        if (!steps.length) return null;
        return section('process', text(fileC.title) || 'How It Works', '', el('ol', { class: 'process-steps' }, steps.map((s, i) =>
            el('li', {}, el('span', { class: 'step-number', text: String(i + 1).padStart(2, '0') }),
                el('h3', { text: s.title }), text(s.text) && el('p', { text: s.text })))));
    }

    function testimonialsSection() {
        const items = list(testimonialsData, 'testimonials').filter(t => text(t.quote));
        if (!items.length) return null;
        return section('reviews', 'What People Say', '', el('div', { class: 'testimonial-grid' }, items.map(t =>
            el('blockquote', { class: 'testimonial' }, el('p', { text: '“' + t.quote + '”' }), text(t.author) && el('footer', { text: '— ' + t.author })))));
    }

    function policiesSection() {
        const items = list(policiesData, 'policies').filter(p => text(p.title) && normalizeUrl(p.file));
        if (!items.length) return null;
        return section('policies', 'Policies & Terms', '', el('ul', { class: 'policy-list' }, items.map(p =>
            el('li', {}, el('a', Object.assign({ href: normalizeUrl(p.file), text: p.title }, newTab)), text(p.summary) && el('span', { text: ' ' + p.summary })))));
    }

    function contactSection() {
        const c = contactInfo;
        const rows = [];
        const row = (icon, label, ...value) => rows.push(el('div', { class: 'contact-item' },
            el('span', { class: 'contact-icon', 'aria-hidden': 'true', text: icon }), el('div', {}, el('h3', { text: label }), el('p', {}, value))));
        if (text(c.email)) row('📧', 'Email', el('a', { href: 'mailto:' + c.email, text: c.email }));
        if (text(c.phone)) row('📱', 'Phone', el('a', { href: J.telHref(c.phone), text: c.phone }));
        if (text(c.whatsapp)) row('💬', 'WhatsApp', el('a', Object.assign({ href: J.waHref(c.whatsapp), text: c.whatsappDisplay || c.whatsapp }, newTab)));
        if (text(c.location)) row('📍', 'Location', c.location);
        if (text(c.hours)) row('🕑', 'Hours', c.hours);
        const booking = normalizeUrl(c.bookingUrl);
        if (!rows.length && !booking) return null;
        return section('contact', type === 'artist' ? "Let's Connect" : 'Get In Touch', text(c.note), [
            el('div', { class: 'contact-grid' }, rows),
            booking && el('p', { class: 'contact-cta' }, el('a', Object.assign({ class: 'btn btn-primary', href: booking, text: text(c.bookingLabel) || 'Book now' }, newTab)))
        ]);
    }

    /* ---- Page shell -------------------------------------------------------- */

    const built = (type === 'artist'
        ? [['About', aboutSection()], ['Music', releasesSection()], ['Videos', videosSection()], ['Live', eventsSection()], ['Reviews', testimonialsSection()]]
        : [['About', aboutSection()], ['Services', offeringsSection()], ['Our Work', gallerySection()], ['Process', processSection()], ['Reviews', testimonialsSection()]]
    ).concat([['Policies', policiesSection()], ['Contact', contactSection()]]).filter(([, node]) => node);
    built.forEach(([, node], i) => node.classList.add(i % 2 ? 'section-alt' : 'section-plain'));

    const hasContact = built.some(([label]) => label === 'Contact');
    const firstAction = built.find(([label]) => label === 'Music' || label === 'Services') || built[0];
    const heroTitle = text(profile.fullName) || name;
    const established = text(String(profile.established || ''));

    const hero = el('header', { id: 'home', class: 'hero' },
        el('div', { class: 'hero-inner' },
            text(profile.badge) && el('span', { class: 'hero-badge', text: profile.badge }),
            el('h1', { class: 'hero-title', text: heroTitle }),
            profile.quote && text(profile.quote.text) && el('p', { class: 'hero-quote', text: '“' + profile.quote.text + '”' + (text(profile.quote.attribution) ? ' — ' + profile.quote.attribution : '') }),
            text(profile.tagline) && el('p', { class: 'hero-tagline', text: profile.tagline }),
            el('div', { class: 'hero-actions' },
                firstAction && el('a', { class: 'btn btn-primary', href: '#' + firstAction[1].id, text: type === 'artist' && firstAction[0] === 'Music' ? 'Listen now' : firstAction[0] === 'Services' ? 'Our services' : 'Learn more' }),
                hasContact && el('a', { class: 'btn btn-outline', href: '#contact', text: 'Get in touch' })),
            profileLinks.length > 0 && el('div', { class: 'hero-links' }, profileLinks.map(l =>
                el('a', Object.assign({ class: 'chip-link', href: l.url }, newTab), el('span', { 'aria-hidden': 'true', text: l.icon }), ' ', l.label)))));
    if (text(profile.images && profile.images.hero)) {
        // set from JS so the path is resolved relative to this page, not to the stylesheet
        hero.style.backgroundImage = 'linear-gradient(rgba(0,0,0,.55), rgba(0,0,0,.55)), url("' + encodeURI(profile.images.hero) + '")';
    }

    const toggle = el('button', { class: 'nav-toggle', type: 'button', 'aria-label': 'Toggle menu', 'aria-expanded': 'false', text: '☰' });
    const menu = el('ul', { class: 'nav-menu' }, built.map(([label, node]) => el('li', {}, el('a', { href: '#' + node.id, text: label }))));
    const nav = el('nav', { class: 'nav' }, el('div', { class: 'nav-inner' },
        el('a', { class: 'nav-back', href: root, text: '← ' + shortName }), toggle, menu));
    toggle.addEventListener('click', () => toggle.setAttribute('aria-expanded', String(nav.classList.toggle('open'))));
    menu.addEventListener('click', event => { if (event.target.closest('a')) { nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); } });

    const footer = el('footer', { class: 'footer' }, el('div', { class: 'container' },
        el('p', {}, '© ' + new Date().getFullYear() + ' ' + name + '. All rights reserved.' + (established ? ' Since ' + established + '.' : '')),
        el('p', { class: 'footer-credit' }, 'Part of ', el('a', { href: root, text: siteName }))));

    app.replaceChildren(nav, el('main', {}, hero, built.map(([, node]) => node)), footer);
    document.body.classList.add('ready');
    J.showProblems();
})();
