// Прогресс чтения
const progressBar = document.getElementById('readingProgress');
if (progressBar) {
    window.addEventListener('scroll', () => {
        const doc = document.documentElement;
        const scrollTop = doc.scrollTop || document.body.scrollTop;
        const scrollHeight = doc.scrollHeight - doc.clientHeight;
        const pct = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
        progressBar.style.width = pct + '%';
    }, { passive: true });
}

// TOC: подсветка активного раздела при скролле
const tocLinks = document.querySelectorAll('.toc-link');
const headings = document.querySelectorAll('.article-body h2[id]');

if (headings.length && tocLinks.length) {
    function updateToc() {
        const scrollY = window.scrollY + 120;
        let current = headings[0];

        headings.forEach(h => {
            if (h.offsetTop <= scrollY) current = h;
        });

        tocLinks.forEach(l => l.classList.remove('toc-active'));
        const active = document.querySelector(`.toc-link[href="#${current.id}"]`);
        if (active) active.classList.add('toc-active');
    }

    window.addEventListener('scroll', updateToc, { passive: true });
    updateToc();
}

// Плавный скролл по якорям TOC
tocLinks.forEach(link => {
    link.addEventListener('click', e => {
        const href = link.getAttribute('href');
        if (!href || !href.startsWith('#')) return;
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            const offset = 84;
            const top = target.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    });
});

// Кнопка "наверх": появляется, когда читатель начинает скроллить вверх
const scrollToTopBtn = document.getElementById('scrollToTop');
if (scrollToTopBtn) {
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        const scrollingUp = currentScrollY < lastScrollY;

        if (currentScrollY < 400) {
            scrollToTopBtn.classList.remove('is-visible');
        } else if (scrollingUp) {
            scrollToTopBtn.classList.add('is-visible');
        } else {
            scrollToTopBtn.classList.remove('is-visible');
        }

        lastScrollY = currentScrollY;
    }, { passive: true });

    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Термины с подсказкой: <span class="term" title="..."> в теле статьи
const terms = document.querySelectorAll('.article-body .term[title]');
if (terms.length) {
    const tip = document.createElement('div');
    tip.className = 'term-tooltip';
    tip.setAttribute('role', 'tooltip');
    tip.id = 'termTooltip';
    document.body.appendChild(tip);

    terms.forEach(el => {
        const text = el.getAttribute('title');
        el.removeAttribute('title'); // отключаем нативный тултип браузера
        el.setAttribute('tabindex', '0');
        el.setAttribute('aria-describedby', 'termTooltip');

        function showTip() {
            tip.textContent = text;
            tip.classList.add('is-visible');

            const rect = el.getBoundingClientRect();
            const tipRect = tip.getBoundingClientRect();

            let top = rect.top - tipRect.height - 8;
            if (top < 8) top = rect.bottom + 8; // не влезает сверху — показываем снизу

            let left = rect.left + rect.width / 2 - tipRect.width / 2;
            left = Math.max(8, Math.min(left, window.innerWidth - tipRect.width - 8));

            tip.style.top = top + 'px';
            tip.style.left = left + 'px';
        }

        function hideTip() {
            tip.classList.remove('is-visible');
        }

        el.addEventListener('mouseenter', showTip);
        el.addEventListener('mouseleave', hideTip);
        el.addEventListener('focus', showTip);
        el.addEventListener('blur', hideTip);
    });
}
