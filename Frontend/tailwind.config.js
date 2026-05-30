/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        blood: {
          DEFAULT: '#C8102E',
          dark: '#8B0000',
          glow: '#FF1744',
          light: '#FF5252'
        },
        surface: {
          DEFAULT: '#0A0E1A',
          2: '#111827',
          3: '#1C2333',
          4: '#243044'
        },
        border: {
          DEFAULT: '#1F2D3D',
          light: '#2D3F55'
        },
        success: '#00D68F',
        warning: '#FFB020',
        critical: '#FF3D71',
        info: '#0095FF',
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'cursive'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'sos-pulse': 'sos-pulse 2s ease-in-out infinite',
        'heartbeat': 'heartbeat 1.5s ease-in-out infinite',
        'blood-drop': 'blood-drop 3s linear infinite',
        'fade-in': 'fadeIn 0.5s ease-in',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      backdropBlur: {
        xs: '2px'
      },
      boxShadow: {
        'blood': '0 0 30px rgba(200, 16, 46, 0.3)',
        'blood-lg': '0 0 60px rgba(200, 16, 46, 0.4)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.4)',
      }
    }
  },
  plugins: []
}
