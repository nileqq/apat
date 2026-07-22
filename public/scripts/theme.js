// Переключатель светлой/тёмной темы.
// Начальное состояние уже выставлено inline-скриптом в <head> (до отрисовки),
// здесь только вешаем обработчик клика и сохраняем выбор.

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

    document.addEventListener('DOMContentLoaded', () => {
        const btn = document.getElementById('themeToggle');
        if (!btn) return;

        btn.addEventListener('click', () => {
            const isDark = root.getAttribute('data-theme') === 'dark';
            setTheme(isDark ? 'light' : 'dark');
        });
    });
})();
