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

