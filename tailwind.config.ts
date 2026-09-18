/** @type {import('tailwindcss').Config} */
const config = {
    content: [
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                /* ---- new design palette ---- */
                flour: 'var(--flour)',
                flour2: 'var(--flour2)',
                cream: 'var(--cream)',
                ink: 'var(--ink)',
                ink2: 'var(--ink2)',
                ember: 'var(--ember)',
                emberd: 'var(--ember-d)',
                honey: 'var(--honey)',
                kraft: 'var(--kraft)',
                sage: 'var(--sage)',

                /* ---- legacy palette (old pages) ---- */
                brand: {
                    DEFAULT: 'var(--primary)',
                    50: 'var(--muted)',
                    100: '#f2e8e5',
                    200: '#eaddd7',
                    300: '#e0c1b3',
                    400: '#d29a8a',
                    500: 'var(--primary)',
                    600: 'var(--primary-dark)',
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
                sans: ['var(--ff-b)'],
                serif: ['var(--ff-d)'],
            },
        },
    },
    plugins: [],
};

/* PHASE 9: module.exports in a .ts config — export default, same as
   next.config.ts was fixed in Phase 1. Behaviour identical. */
export default config;