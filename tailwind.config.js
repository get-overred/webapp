/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        "primary-color": "rgba(250, 0, 0, 0.5)",
        "primary-plus-color": "rgba(250, 0, 0)",
      },
      boxShadow: {
        // ([horizontal offset] [vertical offset] [blur radius] [color, opacity] [spread radius] [color, opacity])
        'centered-sm': '0 0 10px 2px rgb(0 0 0 / 0.1), 0 0 5px 1px rgb(0 0 0 / 0.1)',
        'centered-md': '0 0 15px 2px rgb(0 0 0 / 0.1), 0 0 5px 1px rgb(0 0 0 / 0.1)',
        'centered-lg': '0 0 20px 2px rgb(0 0 0 / 0.1), 0 0 10px 1px rgb(0 0 0 / 0.1)',
        'centered-xl': '0 0 25px 2px rgb(0 0 0 / 0.1), 0 0 15px 1px rgb(0 0 0 / 0.1)',
        'centered-2xl': '0 0 30px 2px rgb(0 0 0 / 0.1), 0 0 20px 1px rgb(0 0 0 / 0.1)'
      }
    }
  },
};