/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        heading: ["shuttleblock", "sans-serif"],
        body: ["helvetica-lt-pro", "sans-serif"],
      },
    },
  },
  plugins: [],
};
