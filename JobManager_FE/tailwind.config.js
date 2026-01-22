/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
            colors: {
                "dark-blue": "#1E293B",
                background: "#F8FAFC",
                heading: "#0A3D78",
                "filled-button": "#0A3D78",
            },
        },
    },
    plugins: [],
};
