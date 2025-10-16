/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./**/*.{scss,css}",           // <- обязательно включи .scss (или точные пути)
    "./src/**/*.{js,ts,jsx,tsx,scss}", // если у тебя src
  ],
  theme: { extend: {} },
  plugins: [],
};
