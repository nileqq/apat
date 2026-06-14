// Фильтрация по категории
const pills   = document.querySelectorAll('.filter-pill');
const entries = document.querySelectorAll('.article-entry');

pills.forEach(pill => {
    pill.addEventListener('click', () => {
        pills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');

        const filter = pill.dataset.filter;
        entries.forEach(entry => {
            const match = filter === 'all' || entry.dataset.category === filter;
            entry.classList.toggle('hidden', !match);
        });
    });
});

// Поиск по заголовку и выдержке
const searchInput = document.getElementById('searchInput');
if (searchInput) {
    searchInput.addEventListener('input', () => {
        const q = searchInput.value.trim().toLowerCase();
        const activeFilter = document.querySelector('.filter-pill.active')?.dataset.filter ?? 'all';

        entries.forEach(entry => {
            const title   = entry.querySelector('.entry-title')?.textContent.toLowerCase() ?? '';
            const excerpt = entry.querySelector('.entry-excerpt')?.textContent.toLowerCase() ?? '';
            const cat     = entry.dataset.category;

            const catOk  = activeFilter === 'all' || cat === activeFilter;
            const textOk = !q || title.includes(q) || excerpt.includes(q);

            entry.classList.toggle('hidden', !(catOk && textOk));
        });
    });
}
