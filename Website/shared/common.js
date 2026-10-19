// Shared behaviour for every artist / service page under Website/.
(function () {
    // ---- Mobile menu (artist pages: #hamburger + #navMenu) -------------------
    const burger = document.getElementById('hamburger');
    const menu = document.getElementById('navMenu');

    if (burger && menu) {
        burger.setAttribute('role', 'button');
        burger.setAttribute('tabindex', '0');
        burger.setAttribute('aria-label', 'Toggle menu');
        burger.setAttribute('aria-expanded', 'false');

        const setOpen = open => {
            menu.classList.toggle('open', open);
            burger.classList.toggle('open', open);
            burger.setAttribute('aria-expanded', String(open));
        };

        burger.addEventListener('click', () => setOpen(!menu.classList.contains('open')));
        burger.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setOpen(!menu.classList.contains('open'));
            }
        });
        menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setOpen(false)));
        document.addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });
    }

    // ---- Footer year ---------------------------------------------------------
    document.querySelectorAll('[data-year]').forEach(el => {
        el.textContent = new Date().getFullYear();
    });
})();
