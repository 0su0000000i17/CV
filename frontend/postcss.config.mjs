/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    '@tailwindcss/postcss': {}, // Используем новый пакет вместо старого 'tailwindcss'
    autoprefixer: {},
  },
};

export default config;
