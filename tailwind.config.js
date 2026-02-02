/** @type {import('tailwindcss').Config} */
module.exports = {
  // Tailwind v4 uses CSS-first config, but DaisyUI may still need this
  daisyui: {
    themes: [
      'zkpredict-light', // Custom light theme (default)
      'light',
      'cupcake',
      'wireframe',
    ],
    base: true,
    styled: true,
    utils: true,
    logs: false,
    themeRoot: ':root',
  },
};