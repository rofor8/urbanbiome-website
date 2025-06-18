import { defineCollection, z } from 'astro:content';

const sections = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    order: z.number(),
    navTitle: z.string().optional(), // Optional title for navigation links
  }),
});

export const collections = { sections };
