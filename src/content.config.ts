import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// The vault: every .md file in src/content/notes becomes a page at /notes/<path>/
// e.g. src/content/notes/setup/tallyprime-setup.md -> /notes/setup/tallyprime-setup/
// Folders become sections in the sidebar tree. Edit locally, push, and it's live.
const notes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/notes' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    // Lower numbers come first within their folder.
    order: z.number().default(99),
  }),
});

export const collections = { notes };
