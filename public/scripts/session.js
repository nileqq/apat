// Управление сессией: обновляет хедер в зависимости от состояния входа.
// Подключается на всех страницах ПОСЛЕ header.css.

(function () {
    const SESSION_KEY = 'qm_session';

    function getSession() {
        try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)); }
        catch { return null; }
    }

    function logout() {
        sessionStorage.removeItem(SESSION_KEY);
        window.location.reload();
    }

    function initHeader() {
        const langSwitcher = document.querySelector('.lang-switcher');
        if (!langSwitcher) return;

        const session = getSession();
        const slot = document.createElement('div');
        slot.className = 'header-auth';

        if (session) {
            // Показываем инициал + имя + кнопку выхода
            const initial = (session.name || '?')[0].toUpperCase();
            slot.innerHTML = `
                <div class="user-pill" id="userPill">
                    <span class="user-avatar">${initial}</span>
                    <span class="user-name">${session.name}</span>
                    <svg class="user-chevron" width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 3.5l3 3 3-3"/></svg>
                </div>
                <div class="user-dropdown" id="userDropdown" hidden>
                    <button class="dropdown-item logout-btn" id="logoutBtn" data-i18n="logout">Шығу</button>
                </div>
            `;
            langSwitcher.before(slot);

            const pill     = slot.querySelector('#userPill');
            const dropdown = slot.querySelector('#userDropdown');

            pill.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.hidden = !dropdown.hidden;
            });

            document.addEventListener('click', () => { dropdown.hidden = true; });

            slot.querySelector('#logoutBtn').addEventListener('click', logout);

        } else {
            // Показываем кнопку входа
            slot.innerHTML = `
                <a href="/login" class="login-btn" data-i18n="nav_login">Кіру</a>
            `;
            langSwitcher.before(slot);
        }
    }

    document.addEventListener('DOMContentLoaded', initHeader);
})();
