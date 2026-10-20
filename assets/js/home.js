/* Home page: builds one card per entry in data/listings.json, reading each card's
   details from that listing's own profile.json (single source of truth). */
(async function () {
    'use strict';
    const J = window.JCS;
    const { root, el, getJSON, text } = J;

    const grid = document.getElementById('listings-grid');
    const filters = document.getElementById('filters');
    document.getElementById('year').textContent = new Date().getFullYear();

    const [site, platforms] = await Promise.all([getJSON(root + 'data/site.json', { optional: true }), J.loadPlatforms()]);

    // Site-wide text (name, tagline, description)
    document.querySelectorAll('[data-site]').forEach(node => {
        const value = site && site[node.dataset.site];
        if (value) node.textContent = value;
    });

    // Footer links (social accounts from data/site.json, plus email)
    const footerLinks = document.getElementById('footer-links');
    J.platformLinks(site && site.links, platforms).forEach(l =>
        footerLinks.append(el('a', { href: l.url, target: '_blank', rel: 'noopener noreferrer', text: l.label })));
    if (site && text(site.contact && site.contact.email)) {
        footerLinks.append(el('a', { href: 'mailto:' + site.contact.email, text: 'Email' }));
    }

    // Listings
    let index;
    try {
        index = await getJSON(root + 'data/listings.json');
    } catch (err) {
        grid.replaceChildren(J.errorBox('The list of artists and services could not be loaded.'));
        J.showProblems();
        return;
    }

    const folderOf = entry => (entry.type === 'service' ? 'services/' : 'artists/') + entry.slug + '/';
    const loaded = await Promise.all(J.list(index, 'listings').map(async entry => {
        const folder = folderOf(entry);
        const profile = await getJSON(root + folder + 'profile.json', { optional: true });
        // status "draft" keeps a listing off the home page while it is being built
        return profile && profile.status !== 'draft' ? { entry, folder, profile } : null;
    }));
    const items = loaded.filter(Boolean);

    const TYPE_LABEL = { artist: 'Artist', service: 'Service' };
    const CTA_LABEL = { artist: 'View Profile', service: 'View Services' };

    function card({ entry, folder, profile }) {
        const type = entry.type === 'service' ? 'service' : 'artist';
        const image = text(profile.images && profile.images.card);
        return el('article', { class: 'card', 'data-type': type },
            image ? el('img', { class: 'card-image', src: root + folder + image, alt: '', loading: 'lazy' })
                  : el('div', { class: 'card-icon', 'aria-hidden': 'true', text: profile.icon || '⭐' }),
            el('span', { class: 'card-tag', text: TYPE_LABEL[type] }),
            el('h3', { text: profile.name }),
            el('p', { text: text(profile.summary) || text(profile.tagline) }),
            el('a', { class: 'btn btn-primary', href: root + folder, text: CTA_LABEL[type] }));
    }

    function render(filter) {
        grid.replaceChildren(...items.filter(i => filter === 'all' || i.entry.type === filter).map(card));
        if (!grid.children.length) grid.append(el('p', { class: 'loading', text: 'Nothing to show yet.' }));
    }

    const types = ['artist', 'service'].filter(t => items.some(i => i.entry.type === t));
    if (types.length > 1) {
        [['all', 'All'], ['artist', 'Artists'], ['service', 'Services']].filter(([k]) => k === 'all' || types.includes(k)).forEach(([key, label], i) => {
            const btn = el('button', { type: 'button', class: 'filter-btn' + (i === 0 ? ' active' : ''), 'aria-pressed': String(i === 0), text: label });
            btn.addEventListener('click', () => {
                filters.querySelectorAll('.filter-btn').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
                btn.classList.add('active');
                btn.setAttribute('aria-pressed', 'true');
                render(key);
            });
            filters.append(btn);
        });
    }
    render('all');
    J.showProblems();
})();
