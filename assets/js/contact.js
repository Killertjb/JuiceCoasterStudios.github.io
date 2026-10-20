/* Studio contact page. Every detail comes from data/site.json. */
(async function () {
    'use strict';
    const J = window.JCS;
    const { root, el, getJSON, text } = J;

    document.getElementById('year').textContent = new Date().getFullYear();
    const [site, platforms] = await Promise.all([getJSON(root + 'data/site.json', { optional: true }), J.loadPlatforms()]);
    const s = site || {};
    const c = s.contact || {};

    document.querySelectorAll('[data-site]').forEach(node => {
        if (s[node.dataset.site]) node.textContent = s[node.dataset.site];
    });

    const cards = document.getElementById('contact-cards');
    const add = (title, ...content) => cards.append(el('div', { class: 'contact-card' }, el('h3', { text: title }), el('p', {}, content)));

    if (text(c.email)) add('Email', el('a', { href: 'mailto:' + c.email, text: c.email }));
    if (text(c.phone)) add('Phone', el('a', { href: J.telHref(c.phone), text: c.phone }));
    if (text(c.whatsapp)) add('WhatsApp', el('a', { href: J.waHref(c.whatsapp), target: '_blank', rel: 'noopener noreferrer', text: c.whatsappDisplay || c.whatsapp }));
    if (text(c.location)) add('Find us', c.location);
    if (text(c.hours)) add('Hours', c.hours);

    const social = J.platformLinks(s.links, platforms);
    if (social.length) {
        add('Social Media', social.flatMap((l, i) => [i ? el('br') : null,
            el('a', { href: l.url, target: '_blank', rel: 'noopener noreferrer', text: l.label })]));
    }

    document.getElementById('contact-form').addEventListener('submit', event => {
        event.preventDefault();
        const name = document.getElementById('f-name').value.trim();
        const email = document.getElementById('f-email').value.trim();
        const message = document.getElementById('f-message').value.trim();
        window.location.href = 'mailto:' + (c.email || '') +
            '?subject=' + encodeURIComponent('Website enquiry from ' + name) +
            '&body=' + encodeURIComponent(message + '\n\n' + name + '\n' + email);
    });
    J.showProblems();
})();
