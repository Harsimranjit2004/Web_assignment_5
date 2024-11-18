/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [`./views/**/*.ejs`],
  theme: {
    extend: {},
  },
  daisyui: {
    themes: ["night"],
  },

  plugins: [require("@tailwindcss/typography"), require("daisyui")],
};
