/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        alienGreen: "#00ff99",
        alienBlue: "#00d4ff",
        alienPurple: "#8e44ad"
      },
      fontFamily: {
        techno: ["Orbitron", "sans-serif"],
        mono: ["Share Tech Mono", "monospace"]
      }
    }
  },
  experimental: {
    appDir: true
  },
  plugins: []
};
