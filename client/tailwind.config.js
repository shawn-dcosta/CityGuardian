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
                    50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd', 400: '#60a5fa',
                    500: '#2563eb', 600: '#1d4ed8', 700: '#1e40af', 800: '#1e3a8a', 900: '#172554', 950: '#0f172a',
                },
                'midnight': {
                    50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1', 400: '#94a3b8',
                    500: '#64748b', 600: '#475569', 700: '#334155', 800: '#1e293b', 900: '#0a0a0a', 950: '#050505',
                },
                'city-black': '#0a0a0a',
                'city-surface': '#141414',
                'city-surface-light': '#f5f5f5',
                'city-white': '#ffffff',
                'city-red': '#D31212', // Danger / Error
                'city-green': '#059669', // Success / Solved / Emerald 600 shade
                'city-orange': '#FF9100', // Warning / Ongoing
                'city-blue': '#2563eb', // Info
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                heading: ['Outfit', 'sans-serif'],
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
