/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: 'var(--bg-canvas)',
        surface: {
          DEFAULT: 'var(--bg-surface)',
          raised: 'var(--bg-surface-raised)',
        },
        border: {
          default: 'var(--border-default)',
          strong: 'var(--border-strong)',
        },
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        accent: {
          DEFAULT: 'var(--accent)',
          muted: 'var(--accent-muted)',
          hover: '#d49332',
        },
        diff: {
          add: 'var(--diff-add)',
          remove: 'var(--diff-remove)',
        },
        // Legacy colors for backwards compatibility during progressive migration
        'bg-dark': 'var(--bg-canvas)',
        'neon-cyan': '#00f0ff',
        'neon-purple': '#9d00ff',
      },
      borderRadius: {
        'xs': '4px',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Inter Tight', 'General Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'Berkeley Mono', 'monospace'],
        heading: ['Inter Tight', 'Outfit', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
