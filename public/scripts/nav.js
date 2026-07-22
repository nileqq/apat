// Плавающая бургер-кнопка навигации: открывает/закрывает всплывающее меню.

(function () {
    document.addEventListener('DOMContentLoaded', () => {
        const wrap = document.getElementById('navFabWrap');
        const btn = document.getElementById('navFabBtn');
        const menu = document.getElementById('navFabMenu');
        if (!wrap || !btn || !menu) return;

        function closeMenu() {
            wrap.classList.remove('is-open');
            btn.setAttribute('aria-expanded', 'false');
        }

        function openMenu() {
            wrap.classList.add('is-open');
            btn.setAttribute('aria-expanded', 'true');
        }

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (wrap.classList.contains('is-open')) closeMenu();
            else openMenu();
        });

        document.addEventListener('click', (e) => {
            if (!wrap.contains(e.target)) closeMenu();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeMenu();
        });
    });
})();
