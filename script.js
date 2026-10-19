// Home page behaviour. Site details and listings come from data/site.js (window.SITE).
(function () {
    const SITE = window.SITE || { listings: [], contact: {} };

    // ---- Fill site-wide text -------------------------------------------------
    document.querySelectorAll('[data-site]').forEach(el => {
        const value = SITE[el.dataset.site];
        if (value) el.textContent = value;
    });
    document.querySelectorAll('[data-year]').forEach(el => {
        el.textContent = new Date().getFullYear();
    });

    // ---- Footer social links -------------------------------------------------
    const c = SITE.contact || {};
    document.querySelectorAll('[data-social]').forEach(a => {
        const key = a.dataset.social;
        if (key === 'email') {
            if (c.email) a.href = 'mailto:' + c.email;
        } else if (c[key] && c[key] !== '#') {
            a.href = c[key];
            a.target = '_blank';
            a.rel = 'noopener';
        }
    });

    // ---- Listing cards + filters --------------------------------------------
    const grid = document.getElementById('listings-grid');
    const filters = document.getElementById('filters');

    function makeCard(item) {
        const card = document.createElement('div');
        card.className = 'service-card';
        card.dataset.category = item.category;

        const icon = document.createElement('div');
        icon.className = 'card-icon';
        icon.textContent = item.icon || '⭐';

        const tag = document.createElement('span');
        tag.className = 'card-tag';
        tag.textContent = item.category;

        const title = document.createElement('h3');
        title.textContent = item.title;

        const text = document.createElement('p');
        text.textContent = item.summary;

        const link = document.createElement('a');
        link.className = 'card-button';
        link.href = item.url;
        link.textContent = item.cta || 'Learn More';

        card.append(icon, tag, title, text, link);
        return card;
    }

    function render(category) {
        grid.innerHTML = '';
        SITE.listings
            .filter(item => category === 'All' || item.category === category)
            .forEach(item => grid.appendChild(makeCard(item)));
    }

    if (grid && SITE.listings.length) {
        const categories = ['All', ...new Set(SITE.listings.map(i => i.category))];
        // Only show filter buttons when there is something to filter.
        if (categories.length > 2) {
            categories.forEach((cat, i) => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'filter-btn' + (i === 0 ? ' active' : '');
                btn.textContent = cat === 'All' ? 'All' : cat + 's';
                btn.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
                btn.addEventListener('click', () => {
                    filters.querySelectorAll('.filter-btn').forEach(b => {
                        b.classList.remove('active');
                        b.setAttribute('aria-pressed', 'false');
                    });
                    btn.classList.add('active');
                    btn.setAttribute('aria-pressed', 'true');
                    render(cat);
                });
                filters.appendChild(btn);
            });
        }
        render('All');
    }

    // ---- Smooth scrolling for in-page links ---------------------------------
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // ---- Navbar shadow on scroll --------------------------------------------
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        navbar.style.boxShadow = window.scrollY > 50
            ? '0 6px 12px rgba(0, 0, 0, 0.15)'
            : '0 4px 6px rgba(0, 0, 0, 0.1)';
    });
})();
