import { Lato, Playfair_Display } from 'next/font/google';

export const lato = Lato({
    subsets: ['latin'],
    weight: ['300', '400', '700'],
    variable: '--font-body',
    display: 'swap',
});

export const playfair = Playfair_Display({
    subsets: ['latin'],
    weight: ['400', '600', '700'],
    style: ['normal', 'italic'],
    variable: '--font-heading',
    display: 'swap',
});