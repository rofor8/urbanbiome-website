import { defineCollection, z } from 'astro:content';

const sections = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    order: z.number(),
    navTitle: z.string().optional(), // Optional title for navigation links
    useComponent: z.string().optional(), // Optional component to render instead of markdown
  }),
});

const team = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    jobTitle: z.string(),
    photo: z.string().optional(),
    linkedinUrl: z.string().optional(),
    bio: z.string(),
    order: z.number(),
  }),
});

const settings = defineCollection({
  type: 'data',
  schema: z.object({
    // Site settings
    siteTitle: z.string().optional(),
    colors: z.object({
      primary: z.string(),
      secondary: z.string(),
      accent: z.string(),
      background: z.string(),
      text: z.string(),
    }).optional(),
    // Contact settings
    email: z.string().optional(),
    formspreeId: z.string().optional(),
  }),
});

export const collections = { sections, team, settings };
