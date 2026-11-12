// @ts-check
import { defineConfig } from 'astro/config';
import { visit } from 'unist-util-visit';

/**
 * Obsidian-style wikilinks in the notes: [[setup/tallyprime-setup]] or
 * [[setup/tallyprime-setup|Tally setup]] becomes a link to /notes/<id>/.
 * Plain remark plugin over text nodes; standard markdown links keep working.
 */
function remarkWikilinks() {
  return (tree) => {
    visit(tree, 'text', (node, index, parent) => {
      if (!parent || typeof node.value !== 'string' || !node.value.includes('[[')) return;
      const parts = node.value.split(/(\[\[[^\]]+\]\])/g);
      if (parts.length === 1) return;
      const children = parts
        .filter((p) => p !== '')
        .map((p) => {
          const m = p.match(/^\[\[([^\]|]+)(?:\|([^\]]+))?\]\]$/);
          if (!m) return { type: 'text', value: p };
          const id = m[1].trim().replace(/^\/+|\/+$/g, '').replace(/\.md$/, '');
          const label = (m[2] || m[1].split('/').pop() || m[1]).trim();
          return { type: 'link', url: `/notes/${id}/`, children: [{ type: 'text', value: label }] };
        });
      parent.children.splice(index, 1, ...children);
    });
  };
}

// Static site served by the Worker in src/worker.js (assets from dist/).
export default defineConfig({
  site: 'https://jobs.vajrapu.com',
  trailingSlash: 'ignore',
  markdown: {
    syntaxHighlight: false,
    remarkPlugins: [remarkWikilinks],
  },
});
