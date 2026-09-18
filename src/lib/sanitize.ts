import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

/* PHASE 3: JSDOM used to be constructed at module load — a ~100–300ms
   cold-start tax on every serverless instance that imported this file,
   even when sanitizeHTML was never called. Built lazily, once, on
   first use instead. */
let cached: ReturnType<typeof DOMPurify> | null = null;

function getPurify() {
    if (!cached) {
        const window = new JSDOM('').window;
        cached = DOMPurify(window as any);
    }
    return cached;
}

export function sanitizeHTML(dirty: string): string {
    return getPurify().sanitize(dirty, {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'code', 'pre'],
        // 'style' kept deliberately: blog posts are admin-authored and
        // existing posts may use inline styles — removing it would
        // change how published posts look.
        ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'style'],
    });
}