// postcss.config.mjs
/**
 * PostCSS configuration for Next.js + Tailwind v4
 * Also supports Sass syntax and Emotion (css prop) usage
 */

const config = {
  plugins: {
    '@tailwindcss/postcss': {},

    // enable nesting (Sass-style nested selectors etc)
    'postcss-nesting': {},

    // if using variables / custom props
    'postcss-custom-properties': {},

    // autoprefixer for vendor prefixes
    autoprefixer: {},
  },
};

export default config;
