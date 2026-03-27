/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#0A0A0B",
                primary: "#6366F1",
                secondary: "#10B981",
                accent: "#F43F5E",
            },
        },
    },
    plugins: [],
}
