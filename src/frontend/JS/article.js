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
const sections = document.querySelectorAll('.article-body section[id]');

if (sections.length && tocLinks.length) {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    tocLinks.forEach(l => l.classList.remove('toc-active'));
                    const active = document.querySelector(`.toc-link[href="#${entry.target.id}"]`);
                    if (active) active.classList.add('toc-active');
                }
            });
        },
        { rootMargin: '-20% 0px -70% 0px' }
    );

    sections.forEach(s => observer.observe(s));
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
