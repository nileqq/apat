// Переключатель светлой/тёмной темы.
// Начальное состояние уже выставлено inline-скриптом в <head> (до отрисовки).
// При клике круг того же цвета, что и новая тема, вырастает из кнопки и
// закрывает весь экран, тема переключается незаметно под ним, затем круг
// сжимается обратно, открывая уже перекрашенную страницу.

(function () {
    const STORAGE_KEY = 'apat-theme';
    const root = document.documentElement;

    function setTheme(theme) {
        if (theme === 'dark') {
            root.setAttribute('data-theme', 'dark');
        } else {
            root.removeAttribute('data-theme');
        }
        try { localStorage.setItem(STORAGE_KEY, theme); } catch (e) {}
    }

    // Кратко переключает атрибут, читает --color-bg целевой темы и
    // возвращает всё как было — без видимого мигания, синхронно.
    function getBgFor(theme) {
        const had = root.getAttribute('data-theme');
        if (theme === 'dark') root.setAttribute('data-theme', 'dark');
        else root.removeAttribute('data-theme');
        const bg = getComputedStyle(root).getPropertyValue('--color-bg').trim();
        if (had === 'dark') root.setAttribute('data-theme', 'dark');
        else root.removeAttribute('data-theme');
        return bg;
    }

    // Ждёт transitionend, но не дольше timeoutMs — если событие почему-то
    // не придёт (свёрнутая вкладка, прерванная анимация и т.п.), смена темы
    // всё равно должна произойти, а не зависнуть навсегда.
    function waitTransformEnd(el, timeoutMs) {
        return new Promise((resolve) => {
            let done = false;
            const finish = () => {
                if (done) return;
                done = true;
                el.removeEventListener('transitionend', onEnd);
                clearTimeout(timer);
                resolve();
            };
            function onEnd(e) {
                if (e.propertyName !== 'transform') return;
                finish();
            }
            el.addEventListener('transitionend', onEnd);
            const timer = setTimeout(finish, timeoutMs);
        });
    }

    async function playReveal(circle, targetTheme, cx, cy) {
        const targetBg = getBgFor(targetTheme);
        const radius = Math.ceil(Math.hypot(
            Math.max(cx, window.innerWidth - cx),
            Math.max(cy, window.innerHeight - cy)
        ));
        const size = radius * 2;

        circle.style.transition = 'none';
        circle.style.background = targetBg;
        circle.style.width = size + 'px';
        circle.style.height = size + 'px';
        circle.style.left = (cx - radius) + 'px';
        circle.style.top = (cy - radius) + 'px';
        circle.style.transform = 'scale(0)';
        circle.style.opacity = '1';
        void circle.offsetWidth; // форсируем reflow перед сменой transition

        circle.style.transition = 'transform 0.6s cubic-bezier(0.76, 0, 0.24, 1)';
        const grow = waitTransformEnd(circle, 900);
        requestAnimationFrame(() => { circle.style.transform = 'scale(1)'; });
        await grow;
    }

    async function playHide(circle) {
        circle.style.transition = 'transform 0.5s cubic-bezier(0.76, 0, 0.24, 1)';
        const shrink = waitTransformEnd(circle, 800);
        requestAnimationFrame(() => { circle.style.transform = 'scale(0)'; });
        await shrink;
        circle.style.opacity = '0';
    }

    document.addEventListener('DOMContentLoaded', () => {
        const btn = document.getElementById('themeToggle');
        const circle = document.getElementById('themeReveal');
        if (!btn) return;

        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        let animating = false;

        btn.addEventListener('click', async () => {
            if (animating) return;

            const isDark = root.getAttribute('data-theme') === 'dark';
            const target = isDark ? 'light' : 'dark';

            if (!circle || reduceMotion) {
                setTheme(target);
                return;
            }

            animating = true;
            const rect = btn.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;

            await playReveal(circle, target, cx, cy);
            setTheme(target);
            await playHide(circle);
            animating = false;
        });
    });
})();
