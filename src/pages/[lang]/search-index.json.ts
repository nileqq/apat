import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export function getStaticPaths() {
  return ['kk', 'ru', 'en'].map(lang => ({ params: { lang } }));
}

const categoryLabels: Record<string, Record<string, string>> = {
  kk: { repression: 'Репрессия', polygon: 'Полигон', famine: 'Голодомор' },
  ru: { repression: 'Репрессии', polygon: 'Полигон', famine: 'Голодомор' },
  en: { repression: 'Repression', polygon: 'Polygon', famine: 'Famine' },
};

// Огрубляет markdown (и авторский синтаксис интервью @Спикер {...}) до простого
// текста, пригодного для полнотекстового поиска.
function stripMarkdown(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/@([^\s{]+)\s*\{([\s\S]*?)\}/g, '$1: $2')
    .replace(/@([^\s{]+)\s+(.+)/g, '$1: $2')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^>\s?/gm, '')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

export const GET: APIRoute = async ({ params }) => {
  const lang = (params.lang as string) ?? 'kk';

  const allArticles = await getCollection('articles');
  const articles = allArticles.filter(a => a.slug.startsWith(`${lang}/`) && !a.data.draft);

  const works = await getCollection('works', ({ data }) => !data.draft && data.lang === lang);

  const items = [
    ...articles.map(a => {
      const slug = a.slug.replace(`${lang}/`, '');
      return {
        id: `article:${slug}`,
        type: 'article' as const,
        title: a.data.title + (a.data.titleItalic ? `: ${a.data.titleItalic}` : ''),
        author: a.data.author,
        category: a.data.category,
        categoryLabel: categoryLabels[lang]?.[a.data.category] ?? a.data.category,
        excerpt: a.data.excerpt,
        date: a.data.date.toISOString(),
        url: `/${lang}/articles/${slug}`,
        body: stripMarkdown(a.body ?? ''),
      };
    }),
    ...works.map(w => ({
      id: `work:${w.slug}`,
      type: 'work' as const,
      title: w.data.title,
      author: w.data.author,
      category: null,
      categoryLabel: null,
      excerpt: '',
      date: w.data.date.toISOString(),
      url: `/${lang}/works/${w.slug}`,
      body: stripMarkdown(w.body ?? ''),
    })),
  ];

  return new Response(JSON.stringify(items), {
    headers: { 'Content-Type': 'application/json' },
  });
};
