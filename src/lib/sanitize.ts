import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// Setup DOMPurify for server-side use
const window = new JSDOM('').window;
const purify = DOMPurify(window as any);

export function sanitizeHTML(dirty: string): string {
    return purify.sanitize(dirty, {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'code', 'pre'],
        ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'style'], // Be careful with 'style', ensure it's safe
    });
}