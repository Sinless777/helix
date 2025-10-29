// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',

  // ✅ Scan all relevant directories for class usage
  content: [
    './app/**/*.{ts,tsx,js,jsx,mdx}',
    './components/**/*.{ts,tsx,js,jsx}',
    './lib/**/*.{ts,tsx,js,jsx}',
    './content/**/*.{ts,tsx,js,jsx}',
  ],

  theme: {
    extend: {
      colors: {
        // Core Helix color palette (extend or override as needed)
        primary: '#F6066F',
        secondary: '#022371',
        accent: '#811570',
        background: '#000000',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        glow: '0 0 10px rgba(246, 6, 111, 0.4)',
      },
    },
  },

  plugins: [
    // ✅ Shadcn UI animation & form utilities (optional)
    require('tailwindcss-animate'),
  ],
}

export default config
