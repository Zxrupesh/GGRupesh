/* ═══════════════════════════════════════════
   landing.js  —  Photo Archive Landing Logic
   ═══════════════════════════════════════════ */

(function () {
    'use strict';

    /* ── FILM STRIP GENERATOR ── */
    var labels = [
        '1985','∎∎∎','1990','▓▓▓','1995','∎∎∎',
        '2000','▓▓▓','2005','∎∎∎','2010','▓▓▓',
        '2015','∎∎∎','2020','▓▓▓','2026','∎∎∎',
    ];

    function buildFilmStrip(trackId, reverse) {
        var track = document.getElementById(trackId);
        if (!track) return;
        var all = labels.concat(labels);
        all.forEach(function(label) {
            var f = document.createElement('div');
            f.className   = 'filmstrip__frame';
            f.textContent = label;
            track.appendChild(f);
        });
        requestAnimationFrame(function () {
            var setWidth = labels.length * 54;
            var duration = setWidth / 28;
            track.style.animation = reverse
                ? 'filmScrollReverse ' + duration + 's linear infinite'
                : 'filmScroll '        + duration + 's linear infinite';
        });
    }

    buildFilmStrip('filmstrip-top',    false);
    buildFilmStrip('filmstrip-bottom', true);

    /* ── SHUTTER CLICK EASTER EGG ── */
    var shutter = document.querySelector('.camera__shutter-btn');
    if (shutter) {
        shutter.addEventListener('click', function () {
            var landing = document.querySelector('.landing-section');
            if (!landing) return;
            landing.style.transition = 'background 0.04s';
            landing.style.background = '#fffbe6';
            setTimeout(function () {
                landing.style.background = '';
                landing.style.transition = '';
            }, 70);
        });
    }

    /* ── KEYBOARD: Enter/Space triggers CTA ── */
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
            var landing = document.getElementById('landing-section');
            if (landing && !landing.classList.contains('hidden')) {
                var btn = document.getElementById('enter-btn');
                if (btn) btn.click();
            }
        }
    });

})();