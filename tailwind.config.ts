/** @type {import('tailwindcss').Config} */
module.exports = {
    // 1. Tell Tailwind where your files are
    content: [
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            // 2. Map your CSS variables to Tailwind colors
            colors: {
                brand: {
                    DEFAULT: 'var(--primary)',
                    50: 'var(--muted)',
                    100: '#f2e8e5',
                    200: '#eaddd7',
                    300: '#e0c1b3',
                    400: '#d29a8a',
                    500: 'var(--primary)',     // Main Brand Color
                    600: 'var(--primary-dark)', // Hover
                    700: 'var(--primary-darker)',
                    800: '#73372f',
                    900: '#5f302b',
                },
                accent: {
                    DEFAULT: 'var(--accent)',
                    dark: 'var(--accent-dark)',
                },
            },
            fontFamily: {
                sans: ['var(--font-body)'],
                serif: ['var(--font-heading)'],
            },
        },
    },
    // 3. Add the Tailwind plugins if you have them installed, otherwise leave empty
    plugins: [],
}