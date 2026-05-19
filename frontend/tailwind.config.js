/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#122033",
        brand: "#0e7490",
        coral: "#f97316",
        mint: "#0f766e",
        steel: "#334155"
      },
      boxShadow: {
        soft: "0 14px 40px rgba(15, 23, 42, 0.08)",
        strong: "0 24px 70px rgba(15, 23, 42, 0.22)"
      }
    }
  },
  plugins: []
};
