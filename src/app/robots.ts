import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

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
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}