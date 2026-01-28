/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                'electric-blue': {
                    50: '#f0f9ff',
                    100: '#e0f2fe',
                    200: '#bae6fd',
                    300: '#7dd3fc',
                    400: '#38bdf8',
                    500: '#0ea5e9',
                    600: '#0284c7',
                    700: '#0369a1',
                    800: '#075985',
                    900: '#0c4a6e',
                    950: '#082f49',
                },
                'deep-charcoal': {
                    50: '#f6f7f9',
                    100: '#edeff2',
                    200: '#d5dae1',
                    300: '#b1bac8',
                    400: '#8695aa',
                    500: '#64748b',
                    600: '#4f5e71',
                    700: '#404b5a',
                    800: '#363e49',
                    900: '#2f353d',
                    950: '#1f2329',
                },
            },
            animation: {
                'shimmer': 'shimmer 1.5s infinite',
            },
            keyframes: {
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                }
            }
        },
    },
    plugins: [],
}
