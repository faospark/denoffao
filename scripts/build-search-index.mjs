import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const ROOT = process.cwd();
const EXCLUDED_HTML = new Set(['ffvi-mods.html', 'update-project-kyaro-realignment.html']);
const OUTPUT_PATH = path.join(ROOT, 'assets', 'search-index.json');

function decodeEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&bull;/g, '•')
    .replace(/&rarr;/g, '→')
    .replace(/&larr;/g, '←')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

function stripHtml(html) {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  );
}

function extractPages() {
  const files = fs
    .readdirSync(ROOT)
    .filter((f) => f.endsWith('.html') && !EXCLUDED_HTML.has(f))
    .sort();

  const items = [];
  for (const file of files) {
    const html = fs.readFileSync(path.join(ROOT, file), 'utf8');
    const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
    const rawTitle = titleMatch ? decodeEntities(titleMatch[1].trim()) : file;
    const title = rawTitle.replace(/\s*[—|]\s*(Faospark's Workshop|Faospark's Den of Mods|Den of Fao).*$/i, '').trim() || rawTitle;

    const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i);
    const description = descMatch ? decodeEntities(descMatch[1].trim()) : '';

    const mainMatch = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
    const bodyHtml = mainMatch ? mainMatch[1] : (html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1] || '');

    const headings = [...bodyHtml.matchAll(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi)]
      .map((m) => stripHtml(m[1]))
      .filter(Boolean)
      .slice(0, 12);

    const text = stripHtml(bodyHtml).slice(0, 1600);

    items.push({
      type: 'page',
      title,
      url: file,
      description,
      tags: headings.slice(0, 6),
      text: `${headings.join(' ')} ${text}`.trim().slice(0, 1800)
    });
  }
  return items;
}

function extractMods() {
  const src = fs.readFileSync(path.join(ROOT, 'components.js'), 'utf8');
  const startMarker = 'const ALL_MODS_DATA = [';
  const startIdx = src.indexOf(startMarker);
  if (startIdx === -1) return [];

  let i = startIdx + startMarker.length - 1;
  let depth = 0;
  let inStr = null;
  let esc = false;
  for (; i < src.length; i++) {
    const ch = src[i];
    if (esc) {
      esc = false;
      continue;
    }
    if (inStr) {
      if (ch === '\\') esc = true;
      else if (ch === inStr) inStr = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      inStr = ch;
    } else if (ch === '[') {
      depth++;
    } else if (ch === ']') {
      depth--;
      if (depth === 0) break;
    }
  }

  const arrayLiteral = src.slice(startIdx + startMarker.length - 1, i + 1);
  const mods = vm.runInNewContext(`(${arrayLiteral})`);

  return mods.map((m) => ({
    type: 'mod',
    title: m.title || '',
    url: m.url || 'mods.html',
    external: /^https?:\/\//i.test(m.url || ''),
    description: m.desc || '',
    meta: [m.game, m.year].filter(Boolean).join(' • '),
    tags: [m.game, m.category, m.year ? String(m.year) : ''].filter(Boolean),
    text: `${m.game || ''} ${m.category || ''} ${m.desc || ''}`.trim()
  }));
}

function extractBlogPosts() {
  const blogPath = path.join(ROOT, 'assets', 'blog', 'blog_data.js');
  if (!fs.existsSync(blogPath)) return [];

  const src = fs.readFileSync(blogPath, 'utf8');
  const sandbox = { window: {} };
  vm.runInNewContext(src, sandbox);
  const posts = Array.isArray(sandbox.window.BLOG_POSTS) ? sandbox.window.BLOG_POSTS : [];

  return posts.map((p) => ({
    type: 'blog',
    title: p.title || '',
    url: `blog.html#${p.slug}`,
    description: p.excerpt || '',
    meta: p.dateFormatted || (p.year ? String(p.year) : ''),
    tags: Array.isArray(p.categories) ? p.categories : [],
    text: stripHtml(p.content || '').slice(0, 1200)
  }));
}

const pages = extractPages();
const mods = extractMods();
const blog = extractBlogPosts();
const index = {
  generatedAt: new Date().toISOString(),
  counts: { pages: pages.length, mods: mods.length, blog: blog.length },
  items: [...pages, ...mods, ...blog]
};

fs.writeFileSync(OUTPUT_PATH, JSON.stringify(index), 'utf8');
const kb = (fs.statSync(OUTPUT_PATH).size / 1024).toFixed(1);
console.log(`Built assets/search-index.json (${kb} KB): ${pages.length} pages, ${mods.length} mods, ${blog.length} blog posts.`);
