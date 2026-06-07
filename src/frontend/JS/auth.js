// ── Утилиты хранилища ────────────────────────────────────────────────────────

const USERS_KEY   = 'qm_users';
const SESSION_KEY = 'qm_session';

function getUsers() {
    try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; }
    catch { return []; }
}

function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function saveSession(user) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ name: user.name, email: user.email }));
}

// Простой хэш — не для продакшена, только для демо
async function hashPassword(pw) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pw));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ── Вспомогательные функции валидации ────────────────────────────────────────

function showError(input, errorEl, msg) {
    input.classList.add('invalid');
    input.classList.remove('valid');
    errorEl.textContent = msg;
}

function clearError(input, errorEl) {
    input.classList.remove('invalid');
    input.classList.add('valid');
    errorEl.textContent = '';
}

function setFormError(el, msg) {
    if (!el) return;
    if (msg) { el.textContent = msg; el.hidden = false; }
    else      { el.textContent = ''; el.hidden = true;  }
}

// ── Страница РЕГИСТРАЦИИ ──────────────────────────────────────────────────────

const registerForm = document.getElementById('registerForm');
if (registerForm) {
    const nameInput     = document.getElementById('name');
    const emailInput    = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmInput  = document.getElementById('confirm');
    const nameError     = document.getElementById('nameError');
    const emailError    = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    const confirmError  = document.getElementById('confirmError');
    const formError     = document.getElementById('formError');
    const submitBtn     = registerForm.querySelector('.auth-submit');

    // Toggle password visibility
    document.getElementById('togglePass')?.addEventListener('click', () => {
        passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
    });

    // Inline validation on blur
    nameInput.addEventListener('blur', () => {
        if (!nameInput.value.trim())
            showError(nameInput, nameError, getValidationMsg('name_required'));
        else if (nameInput.value.trim().length < 2)
            showError(nameInput, nameError, getValidationMsg('name_short'));
        else
            clearError(nameInput, nameError);
    });

    emailInput.addEventListener('blur', () => {
        if (!emailInput.value.trim())
            showError(emailInput, emailError, getValidationMsg('email_required'));
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value))
            showError(emailInput, emailError, getValidationMsg('email_invalid'));
        else
            clearError(emailInput, emailError);
    });

    passwordInput.addEventListener('blur', () => {
        if (passwordInput.value.length < 8)
            showError(passwordInput, passwordError, getValidationMsg('password_short'));
        else
            clearError(passwordInput, passwordError);
    });

    confirmInput.addEventListener('blur', () => {
        if (confirmInput.value !== passwordInput.value)
            showError(confirmInput, confirmError, getValidationMsg('confirm_mismatch'));
        else
            clearError(confirmInput, confirmError);
    });

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        setFormError(formError, '');

        const name     = nameInput.value.trim();
        const email    = emailInput.value.trim().toLowerCase();
        const password = passwordInput.value;
        const confirm  = confirmInput.value;

        // Финальная валидация
        let ok = true;
        if (!name || name.length < 2) { showError(nameInput, nameError, getValidationMsg('name_required')); ok = false; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showError(emailInput, emailError, getValidationMsg('email_invalid')); ok = false; }
        if (password.length < 8) { showError(passwordInput, passwordError, getValidationMsg('password_short')); ok = false; }
        if (password !== confirm) { showError(confirmInput, confirmError, getValidationMsg('confirm_mismatch')); ok = false; }
        if (!ok) return;

        // Проверка дубликата
        const users = getUsers();
        if (users.find(u => u.email === email)) {
            setFormError(formError, getValidationMsg('email_taken'));
            showError(emailInput, emailError, ' ');
            return;
        }

        submitBtn.disabled = true;
        const hash = await hashPassword(password);
        users.push({ name, email, hash });
        saveUsers(users);
        saveSession({ name, email });
        window.location.href = 'main.html';
    });
}

// ── Страница ВХОДА ────────────────────────────────────────────────────────────

const loginForm = document.getElementById('loginForm');
if (loginForm) {
    const emailInput    = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const emailError    = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    const formError     = document.getElementById('formError');
    const submitBtn     = loginForm.querySelector('.auth-submit');

    document.getElementById('togglePass')?.addEventListener('click', () => {
        passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        setFormError(formError, '');

        const email    = emailInput.value.trim().toLowerCase();
        const password = passwordInput.value;

        let ok = true;
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showError(emailInput, emailError, getValidationMsg('email_invalid')); ok = false; }
        if (!password) { showError(passwordInput, passwordError, getValidationMsg('password_required')); ok = false; }
        if (!ok) return;

        submitBtn.disabled = true;
        const hash  = await hashPassword(password);
        const users = getUsers();
        const user  = users.find(u => u.email === email && u.hash === hash);

        if (!user) {
            submitBtn.disabled = false;
            setFormError(formError, getValidationMsg('credentials_wrong'));
            showError(emailInput, emailError, ' ');
            showError(passwordInput, passwordError, ' ');
            return;
        }

        saveSession(user);
        window.location.href = 'main.html';
    });
}

// ── Строки валидации (i18n-friendly) ─────────────────────────────────────────

const validationMsgs = {
    kk: {
        name_required:    'Аты-жөніңізді енгізіңіз',
        name_short:       'Кемінде 2 таңба болуы керек',
        email_required:   'Поштаңызды енгізіңіз',
        email_invalid:    'Email дұрыс емес',
        email_taken:      'Бұл email тіркелген',
        password_required:'Құпия сөзді енгізіңіз',
        password_short:   'Кемінде 8 таңба болуы керек',
        confirm_mismatch: 'Құпия сөздер сәйкес келмейді',
        credentials_wrong:'Email немесе құпия сөз қате',
    },
    ru: {
        name_required:    'Введите ваше имя',
        name_short:       'Минимум 2 символа',
        email_required:   'Введите email',
        email_invalid:    'Некорректный email',
        email_taken:      'Этот email уже зарегистрирован',
        password_required:'Введите пароль',
        password_short:   'Минимум 8 символов',
        confirm_mismatch: 'Пароли не совпадают',
        credentials_wrong:'Неверный email или пароль',
    },
    en: {
        name_required:    'Please enter your name',
        name_short:       'At least 2 characters required',
        email_required:   'Please enter your email',
        email_invalid:    'Invalid email address',
        email_taken:      'This email is already registered',
        password_required:'Please enter your password',
        password_short:   'At least 8 characters required',
        confirm_mismatch: 'Passwords do not match',
        credentials_wrong:'Incorrect email or password',
    },
};

function getValidationMsg(key) {
    const lang = document.documentElement.lang || 'kk';
    return validationMsgs[lang]?.[key] ?? validationMsgs.kk[key] ?? key;
}
