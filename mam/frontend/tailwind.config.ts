import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Lato', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        heading: ['Exo', 'Inter', 'sans-serif'],
        mono: ['Fragment Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        // Iconik-inspired dark theme
        primary: {
          DEFAULT: '#007FFF',
          hover: '#0066CC',
          active: '#0052A3',
        },
        background: {
          dark: '#1A1D21',
          medium: '#2A2D31',
          light: '#3A3D41',
          hover: '#4A4D51',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#B4B7BB',
          muted: '#8A8D91',
          input: '#33475B',
        },
        status: {
          ready: '#28A745',
          processing: '#6C63FF',
          failed: '#F2545B',
          archived: '#8A8D91',
        },
        success: '#28A745',
        warning: '#FFC107',
        error: '#F2545B',
        info: '#17A2B8',
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '8px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        full: '50px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
};

export default config;
