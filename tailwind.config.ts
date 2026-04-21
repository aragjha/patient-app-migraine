import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        sm: "390px",
        md: "390px",
        lg: "390px",
        xl: "390px",
        "2xl": "390px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // NeuraChamp typography scale - accessible for Parkinson's patients
        'h1': ['1.75rem', { lineHeight: '2.25rem', fontWeight: '700' }], // 28sp
        'h1-lg': ['2rem', { lineHeight: '2.5rem', fontWeight: '700' }], // 32sp
        'h2': ['1.25rem', { lineHeight: '1.75rem', fontWeight: '700' }], // 20sp
        'h2-lg': ['1.375rem', { lineHeight: '1.875rem', fontWeight: '700' }], // 22sp
        'body': ['1rem', { lineHeight: '1.5rem', fontWeight: '500' }], // 16sp
        'body-lg': ['1.125rem', { lineHeight: '1.75rem', fontWeight: '500' }], // 18sp
        'helper': ['0.8125rem', { lineHeight: '1.125rem', fontWeight: '500' }], // 13sp
        'helper-lg': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '500' }], // 14sp
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // NeuraChamp specific
        cta: {
          DEFAULT: "hsl(var(--cta-fill))",
          text: "hsl(var(--cta-text))",
          highlight: "hsl(var(--cta-highlight))",
        },
        xp: "hsl(var(--xp-gold))",
        streak: "hsl(var(--streak-orange))",
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      spacing: {
        // 8dp grid system
        'safe-top': 'var(--safe-top)',
        'safe-bottom': 'var(--safe-bottom)',
        'content': 'var(--content-padding)',
        '18': '4.5rem', // 72px
        '22': '5.5rem', // 88px
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 4px)",
        sm: "calc(var(--radius) - 8px)",
        '3xl': '1.5rem', // 24dp for cards
        '4xl': '2rem',
      },
      boxShadow: {
        'cta': '0 4px 12px rgba(249, 112, 102, 0.25)',
        'cta-hover': '0 8px 24px hsla(213, 58%, 34%, 0.22)',
        'card': '0 4px 16px hsla(0, 0%, 0%, 0.05)',
        'card-dark': '0 4px 16px hsla(0, 0%, 0%, 0.2)',
        'sm-soft': '0 1px 2px rgba(27, 42, 78, 0.04)',
        'md-soft': '0 2px 4px rgba(27, 42, 78, 0.05), 0 4px 8px rgba(27, 42, 78, 0.04)',
        'lg-soft': '0 4px 12px rgba(27, 42, 78, 0.08), 0 8px 24px rgba(27, 42, 78, 0.06)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "slide-up": {
          from: { transform: "translateY(100%)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "scale-in": {
          from: { transform: "scale(0.9)", opacity: "0" },
          to: { transform: "scale(1)", opacity: "1" },
        },
        "bounce-in": {
          "0%": { transform: "scale(0)", opacity: "0" },
          "50%": { transform: "scale(1.1)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "slide-up": "slide-up 0.4s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "scale-in": "scale-in 0.3s ease-out",
        "bounce-in": "bounce-in 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
