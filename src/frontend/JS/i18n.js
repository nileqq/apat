const translations = {
    kk: {
        nav_articles:      'Мақалалар',
        nav_about:         'Жоба туралы',
        hero_title:        'Естелік сақталуы тиіс',
        hero_sub:          'Репрессия, полигон және голодомор құрбандарының тарихи куәліктері',
        search_placeholder:'Мақала іздеу...',
        section_recent:    'Соңғы мақалалар',
        tag_repression:    'Репрессия',
        tag_polygon:       'Полигон',
        tag_famine:        'Голодомор',
        article_excerpt:   'Қысқаша мазмұн осы жерде — оқырман не туралы екенін бірден түсінеді...',
        footer_copy:       '© 2026 Апат',
        footer_contact:    'Байланыс',
    },
    ru: {
        nav_articles:      'Статьи',
        nav_about:         'О проекте',
        hero_title:        'Память должна сохраниться',
        hero_sub:          'Исторические свидетельства жертв репрессий, полигона и голодомора',
        search_placeholder:'Поиск статей...',
        section_recent:    'Последние статьи',
        tag_repression:    'Репрессии',
        tag_polygon:       'Полигон',
        tag_famine:        'Голодомор',
        article_excerpt:   'Краткое содержание — читатель сразу понимает, о чём материал...',
        footer_copy:       '© 2026 Апат',
        footer_contact:    'Контакты',
    },
    en: {
        nav_articles:      'Articles',
        nav_about:         'About',
        hero_title:        'Memory Must Be Preserved',
        hero_sub:          'Historical testimonies of victims of repressions, the polygon, and the famine',
        search_placeholder:'Search articles...',
        section_recent:    'Recent Articles',
        tag_repression:    'Repression',
        tag_polygon:       'Polygon',
        tag_famine:        'Famine',
        article_excerpt:   'A short excerpt — the reader immediately understands what the article is about...',
        footer_copy:       '© 2026 Apat',
        footer_contact:    'Contact',
    },
};

let currentLang = 'kk';

function applyLang(lang) {
    currentLang = lang;
    const t = translations[lang];

    // Обновляем все элементы с data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        if (t[key] !== undefined) el.textContent = t[key];
    });

    // Обновляем placeholder у инпутов/textarea
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
        const key = el.dataset.i18nPh;
        if (t[key] !== undefined) el.placeholder = t[key];
    });

    // Подсвечиваем активную кнопку
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    // Меняем lang у <html> для скринридеров
    document.documentElement.lang = lang;
}

// Вешаем обработчики на кнопки после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => applyLang(btn.dataset.lang));
    });

    // Запускаем с казахским по умолчанию
    applyLang('kk');
});
