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
