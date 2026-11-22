/** @type {import("prettier").Config} */
const config = {
  plugins: [
    "prettier-plugin-astro",
    "prettier-plugin-tailwindcss", // MUST come last
  ],
  tailwindStylesheet: "./src/styles/index.css",
  overrides: [
    {
      files: "*.astro",
      options: {
        parser: "astro",
      },
    },
  ],
};

export default config;
