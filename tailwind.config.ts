import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#2776EA",
                secondary: "#FFD700",
                accent: "#C0C0C0",
            },
            fontFamily: {
                sans: ["Montserrat", "sans-serif"],
                serif: ["Felix Titling", "serif"],
            },
        },
    },
    plugins: [],
    corePlugins: {
        preflight: false,
    },
};
export default config;
