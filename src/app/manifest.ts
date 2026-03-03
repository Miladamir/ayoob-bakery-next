import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Ayoob Bakery Australia',
        short_name: 'Ayoob Bakery',
        description: 'Premium Artisan Breads & Pastries',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#c37560', // Your brand color
        // THIS is the key for Speed Dial:
        icons: [
            {
                src: '/images/logo.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/images/logo.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    }
}