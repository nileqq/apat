import { defineCollection, z } from 'astro:content';

const articles = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    titleItalic: z.string().optional(),
    author: z.string(),
    date: z.coerce.date(),
    category: z.enum(['repression', 'polygon', 'famine']),
    excerpt: z.string(),
    volume: z.string().optional(),
    cover: z.string().optional(),
    kicker: z.string().optional(),
    draft: z.boolean().optional().default(false),
  }),
});

export const collections = {
  articles: articles,
};
