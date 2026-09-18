import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                // Block sensitive areas from being indexed
                disallow: [
                    '/admin/',
                    '/profile/',
                    '/api/',
                    '/cart/',
                    '/checkout',
                    '/login',
                    '/signup',
                    '/search' // Usually we don't want search pages indexed as they create infinite loops
                ],
            },
        ],
        sitemap: `${SITE_URL}/sitemap.xml`,
    };
}