const defaultTheme = require('tailwindcss/defaultTheme');

// Your 10-color palette (light to dark)
const colorPalette = {
  // Light backgrounds (lightest 3 colors)
  'palette-1': '#F5EBC9',  // Light cream yellow
  'palette-2': '#E8D5C4',  // Warm beige
  'palette-3': '#DFC0C9',  // Soft taupe
  
  // Mid tones (colors 4-6)
  'palette-4': '#D4A8D4',  // Light mauve
  'palette-5': '#C294DC',  // Soft purple
  'palette-6': '#9B7FBF',  // Medium purple
  
  // Dark tones (darkest 4 colors)
  'palette-7': '#6B5BA3',  // Deep purple
  'palette-8': '#4A4680',  // Dark indigo
  'palette-9': '#2F2E5E',  // Very dark navy
  'palette-10': '#1a1a3e', // Darkest navy
};

module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Custom palette colors
        palette: colorPalette,
        
        // Semantic color mappings for easy usage
        primary: {
          light: colorPalette['palette-4'],   // Mauve
          DEFAULT: colorPalette['palette-5'], // Soft purple
          dark: colorPalette['palette-7'],    // Deep purple
        },
        secondary: {
          light: colorPalette['palette-2'],   // Beige
          DEFAULT: colorPalette['palette-6'], // Medium purple
          dark: colorPalette['palette-8'],    // Dark indigo
        },
        accent: {
          light: colorPalette['palette-1'],   // Cream yellow (for highlights)
          DEFAULT: colorPalette['palette-3'], // Soft taupe
          dark: colorPalette['palette-9'],    // Very dark navy
        },
        background: {
          light: colorPalette['palette-10'],  // Darkest navy (main background)
          DEFAULT: colorPalette['palette-10'],
          paper: colorPalette['palette-9'],   // Very dark navy (cards)
        },
        surface: {
          light: colorPalette['palette-9'],   // Dark navy
          DEFAULT: colorPalette['palette-8'], // Dark indigo
        },
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        brand: ['Inter', ...defaultTheme.fontFamily.sans],
        serif: ['Inter', ...defaultTheme.fontFamily.sans],
        mono: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      boxShadow: {
        xs: '0 0 0 1px rgba(0, 0, 0, 0.05)',
        solid: '0 0 0 2px currentColor',
        outline: `0 0 0 3px rgba(212, 168, 212, .5)`,
        'outline-primary': `0 0 0 3px rgba(194, 148, 220, .5)`,
        'outline-accent': `0 0 0 3px rgba(245, 235, 201, .5)`,
      },
      typography: theme => ({
        light: {
          css: [
            {
              color: theme('colors.palette.2'),
              '[class~="lead"]': {
                color: theme('colors.palette.1'),
              },
              a: {
                color: theme('colors.palette.1'),
                textDecoration: 'underline',
                '&:hover': {
                  color: theme('colors.palette.4'),
                },
              },
              strong: {
                color: theme('colors.palette.1'),
              },
              'ol > li::before': {
                color: theme('colors.palette.2'),
              },
              'ul > li::before': {
                backgroundColor: theme('colors.palette.6'),
              },
              hr: {
                borderColor: theme('colors.palette.8'),
              },
              blockquote: {
                color: theme('colors.palette.2'),
                borderLeftColor: theme('colors.palette.6'),
              },
              h1: {
                color: theme('colors.palette.1'),
              },
              h2: {
                color: theme('colors.palette.2'),
              },
              h3: {
                color: theme('colors.palette.3'),
              },
              h4: {
                color: theme('colors.palette.4'),
              },
              'figure figcaption': {
                color: theme('colors.palette.3'),
              },
              code: {
                color: theme('colors.palette.1'),
                backgroundColor: theme('colors.palette.8'),
                padding: '0.2em 0.4em',
                borderRadius: '0.3em',
              },
              'a code': {
                color: theme('colors.palette.1'),
              },
              pre: {
                color: theme('colors.palette.2'),
                backgroundColor: theme('colors.palette.9'),
              },
              thead: {
                color: theme('colors.palette.1'),
                borderBottomColor: theme('colors.palette.6'),
              },
              'tbody tr': {
                borderBottomColor: theme('colors.palette.8'),
              },
            },
          ],
        },
      }),

      animation: {
        blob1: 'blob 9s infinite',
        blob2: 'blob 9s infinite 2s',
      },
      keyframes: {
        blob: {
          '0%': {
            transform: 'scale(1)',
          },
          '33%': {
            transform: 'scale(1.1) translateX(8rem) translateY(3rem)',
          },
          '66%': {
            transform: 'scale(0.9) translateX(-8rem) translateY(-3rem)',
          },
          '100%': {
            transform: 'scale(1)',
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
};
