/* Light / dark toggle for the home page and the studio contact page.
   The saved choice (or the device setting) is applied by the small script in each page's <head>, before the
   page paints, so there is no flash. This file only handles the button, saving, and following the device
   setting until the visitor makes a choice. The look of each theme is in assets/css/home.css. */
(function () {
    'use strict';
    var KEY = 'jes-theme';
    var root = document.documentElement;
    var button = document.getElementById('theme-toggle');
    var metaTheme = document.querySelector('meta[name="theme-color"]');
    var dark = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
    var timer;

    function saved() {
        try {
            var v = localStorage.getItem(KEY);
            return v === 'dark' || v === 'light' ? v : null;
        } catch (e) { return null; }          // storage can be blocked (private mode); the toggle still works
    }

    function save(theme) {
        try { localStorage.setItem(KEY, theme); } catch (e) { /* not saved, fine */ }
    }

    function current() {
        return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    }

    function reflect() {
        var isDark = current() === 'dark';
        if (button) {
            var label = isDark ? 'Switch to light mode' : 'Switch to dark mode';
            button.setAttribute('aria-label', label);
            button.setAttribute('title', label);
        }
        if (metaTheme) metaTheme.setAttribute('content', isDark ? '#0b1120' : '#ffffff');   // browser bar colour on phones
    }

    function apply(theme) {
        root.classList.add('theme-transition');           // fades every colour (see home.css)
        clearTimeout(timer);
        timer = setTimeout(function () { root.classList.remove('theme-transition'); }, 500);
        root.setAttribute('data-theme', theme);
        reflect();
    }

    if (button) {
        button.addEventListener('click', function () {
            var next = current() === 'dark' ? 'light' : 'dark';
            save(next);
            apply(next);
        });
    }

    // Until the visitor picks a theme themselves, follow the device setting if it changes.
    if (dark && dark.addEventListener) {
        dark.addEventListener('change', function (e) {
            if (!saved()) apply(e.matches ? 'dark' : 'light');
        });
    }

    reflect();
})();
