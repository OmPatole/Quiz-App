/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
                mono: ['JetBrains Mono', 'Consolas', 'Monaco', 'Courier New', 'monospace'],
            },
            colors: {
                primary: {
                    50: '#f3f4ff',
                    100: '#e8ebff',
                    200: '#d4dafd',
                    300: '#b4c0fb',
                    400: '#8c9aef',
                    500: '#6f7de7',
                    600: '#5f6eea',
                    700: '#4f5dd9',
                    800: '#404bb9',
                    900: '#333c94',
                },
                brand: {
                    50: '#f3f4ff',
                    100: '#e8ebff',
                    200: '#d4dafd',
                    300: '#b4c0fb',
                    400: '#8c9aef',
                    500: '#6f7de7',
                    600: '#5f6eea',
                    700: '#4f5dd9',
                    800: '#404bb9',
                    900: '#333c94',
                },
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-in-out',
                'slide-up': 'slideUp 0.5s ease-out',
                'glow': 'glow 2s ease-in-out infinite',
                'float': 'float 6s ease-in-out infinite',
                'float-slow': 'floatSlow 9s ease-in-out infinite',
                'pulse-soft': 'pulseSoft 4s ease-in-out infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                glow: {
                    '0%, 100%': { opacity: '0.5' },
                    '50%': { opacity: '1' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-12px)' },
                },
                floatSlow: {
                    '0%, 100%': { transform: 'translateY(0px) translateX(0px)' },
                    '50%': { transform: 'translateY(-18px) translateX(8px)' },
                },
                pulseSoft: {
                    '0%, 100%': { opacity: '0.45', transform: 'scale(1)' },
                    '50%': { opacity: '0.85', transform: 'scale(1.03)' },
                },
            },
        },
    },
    plugins: [],
}
