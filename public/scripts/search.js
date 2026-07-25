// Полнотекстовый поиск по статьям и работам текущего языка.
// Алгоритм: инвертированный индекс с весами по полям (заголовок > автор >
// аннотация > текст), точные + префиксные совпадения, и запасной вариант
// с опечатками (расстояние Левенштейна) для более длинных слов.

(function () {
    const LANGS = ['kk', 'ru', 'en'];

    const LABELS = {
        kk: { readMore: 'Оқу →', work: 'Жұмыс', noResults: 'Ештеңе табылмады' },
        ru: { readMore: 'Читать →', work: 'Работа', noResults: 'Ничего не найдено' },
        en: { readMore: 'Read →', work: 'Work', noResults: 'No results found' },
    };

    function getLangFromUrl() {
        const parts = window.location.pathname.split('/').filter(Boolean);
        return LANGS.includes(parts[0]) ? parts[0] : 'kk';
    }

    function tokenize(text) {
        return (text || '')
            .toLowerCase()
            .normalize('NFKC')
            .match(/[\p{L}\p{N}]+/gu) || [];
    }

    const FIELD_WEIGHTS = { title: 6, author: 2, excerpt: 3, body: 1 };

    function buildIndex(items) {
        const index = new Map();  // token -> Map(itemIndex -> score)
        const vocab = new Set();

        items.forEach((item, i) => {
            Object.keys(FIELD_WEIGHTS).forEach((field) => {
                const weight = FIELD_WEIGHTS[field];
                const counts = new Map();
                tokenize(item[field]).forEach((tok) => {
                    counts.set(tok, (counts.get(tok) || 0) + 1);
                });
                counts.forEach((count, tok) => {
                    vocab.add(tok);
                    const score = weight * (1 + Math.log(count));
                    if (!index.has(tok)) index.set(tok, new Map());
                    const bucket = index.get(tok);
                    bucket.set(i, (bucket.get(i) || 0) + score);
                });
            });
        });

        return { index, vocab };
    }

    function levenshtein(a, b, max) {
        if (Math.abs(a.length - b.length) > max) return max + 1;
        let prevRow = Array.from({ length: a.length + 1 }, (_, i) => i);
        for (let j = 1; j <= b.length; j++) {
            const row = [j];
            for (let i = 1; i <= a.length; i++) {
                row[i] = a[i - 1] === b[j - 1]
                    ? prevRow[i - 1]
                    : 1 + Math.min(prevRow[i - 1], prevRow[i], row[i - 1]);
            }
            prevRow = row;
        }
        return prevRow[a.length];
    }

    function runSearch(query, items, { index, vocab }, limit) {
        const terms = tokenize(query);
        if (terms.length === 0) return [];

        const scores = new Map(); // itemIndex -> score
        const vocabList = Array.from(vocab);

        terms.forEach((term) => {
            let matchedExact = false;

            if (index.has(term)) {
                matchedExact = true;
                index.get(term).forEach((s, i) => scores.set(i, (scores.get(i) || 0) + s));
            }

            if (term.length >= 3) {
                vocabList.forEach((tok) => {
                    if (tok !== term && tok.startsWith(term)) {
                        index.get(tok).forEach((s, i) => scores.set(i, (scores.get(i) || 0) + s * 0.6));
                    }
                });
            }

            if (!matchedExact && term.length >= 4) {
                const maxDist = term.length <= 5 ? 1 : 2;
                vocabList.forEach((tok) => {
                    if (Math.abs(tok.length - term.length) > maxDist) return;
                    if (levenshtein(tok, term, maxDist) <= maxDist) {
                        index.get(tok).forEach((s, i) => scores.set(i, (scores.get(i) || 0) + s * 0.35));
                    }
                });
            }
        });

        return Array.from(scores.entries())
            .map(([i, score]) => ({ item: items[i], score }))
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
    }

    function buildSnippet(body, terms, maxLen) {
        if (!body) return '';
        const lower = body.toLowerCase();
        let idx = -1;
        for (const t of terms) {
            idx = lower.indexOf(t);
            if (idx !== -1) break;
        }
        if (idx === -1) idx = 0;
        const start = Math.max(0, idx - 40);
        let snippet = body.slice(start, start + maxLen).trim();
        if (start > 0) snippet = '…' + snippet;
        if (start + maxLen < body.length) snippet += '…';
        return snippet;
    }

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    document.addEventListener('DOMContentLoaded', () => {
        const searchInput = document.getElementById('searchInput');
        const articleList = document.getElementById('articleList');
        const resultsBox = document.getElementById('searchResults');
        const filterPills = document.querySelector('.filter-pills');
        if (!searchInput || !articleList || !resultsBox) return;

        const lang = getLangFromUrl();
        const t = LABELS[lang] || LABELS.kk;

        let items = null;
        let indexData = null;
        let loading = null;

        function ensureIndex() {
            if (loading) return loading;
            loading = fetch(`/${lang}/search-index.json`)
                .then((res) => res.json())
                .then((data) => {
                    items = data;
                    indexData = buildIndex(items);
                });
            return loading;
        }

        function renderResults(query) {
            const terms = tokenize(query);
            const results = runSearch(query, items, indexData, 30);

            if (results.length === 0) {
                resultsBox.innerHTML = `<p class="articles-empty">${escapeHtml(t.noResults)}</p>`;
                return;
            }

            resultsBox.innerHTML = results.map(({ item }) => {
                const year = new Date(item.date).getFullYear();
                const badge = item.type === 'article'
                    ? `<span class="entry-eyebrow eyebrow-${item.category}">${escapeHtml(item.categoryLabel)}</span>`
                    : `<span class="entry-eyebrow eyebrow-work">${escapeHtml(t.work)}</span>`;
                const excerpt = item.excerpt || buildSnippet(item.body, terms, 170);

                return `
                    <a href="${item.url}" class="article-entry">
                        <div class="entry-meta">
                            ${badge}
                            <span class="entry-separator" aria-hidden="true">◆</span>
                            <span class="entry-date">${year}</span>
                        </div>
                        <h2 class="entry-title">${escapeHtml(item.title)}</h2>
                        <p class="entry-author">${escapeHtml(item.author)}</p>
                        <p class="entry-excerpt">${escapeHtml(excerpt)}</p>
                        <span class="entry-read">${escapeHtml(t.readMore)}</span>
                    </a>
                `;
            }).join('');
        }

        searchInput.addEventListener('input', () => {
            const query = searchInput.value.trim();

            if (!query) {
                resultsBox.classList.add('is-hidden');
                resultsBox.innerHTML = '';
                articleList.classList.remove('is-hidden');
                if (filterPills) filterPills.classList.remove('is-hidden');
                return;
            }

            if (filterPills) filterPills.classList.add('is-hidden');
            articleList.classList.add('is-hidden');
            resultsBox.classList.remove('is-hidden');

            ensureIndex().then(() => renderResults(query));
        });
    });
})();
