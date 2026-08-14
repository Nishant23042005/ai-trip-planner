import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ["var(--font-plus-jakarta)", "sans-serif"],
        sans: ["var(--font-plus-jakarta)", "sans-serif"],
      },
      colors: {
        background: "var(--background)",
        "background-secondary": "var(--background-secondary)",
        foreground: "var(--foreground)",
        "foreground-secondary": "var(--secondary-foreground)",
        "foreground-muted": "var(--muted-foreground)",
        card: "var(--card)",
        "card-foreground": "var(--card-foreground)",
        "card-hover": "var(--card-hover)",
        popover: "var(--popover)",
        "popover-foreground": "var(--popover-foreground)",
        muted: "var(--muted)",
        primary: "var(--primary)",
        "primary-foreground": "var(--primary-foreground)",
        secondary: "var(--secondary)",
        "secondary-foreground": "var(--secondary-foreground)",
        accent: "var(--accent)",
        "accent-foreground": "var(--accent-foreground)",
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        success: "var(--success)",
        warning: "var(--warning)",
        error: "var(--error)",
        info: "var(--info)",
        glass: {
          bg: "var(--glass-background)",
          border: "var(--glass-border)",
        },
        // Dedicated Icon theme tokens
        icon: {
          primary: "var(--icon-primary)",
          secondary: "var(--icon-secondary)",
          active: "var(--icon-active)",
        },
        // Dedicated Badge theme tokens
        badge: {
          "teal-bg": "var(--badge-teal-bg)",
          "teal-text": "var(--badge-teal-text)",
          "blue-bg": "var(--badge-blue-bg)",
          "blue-text": "var(--badge-blue-text)",
          "amber-bg": "var(--badge-amber-bg)",
          "amber-text": "var(--badge-amber-text)",
        },
      },
      boxShadow: {
        glass: "var(--glass-shadow)",
        "glass-strong": "0 10px 30px -5px rgba(0, 0, 0, 0.05)",
        neumorphic: "6px 6px 16px rgba(0, 0, 0, 0.03), -4px -4px 12px rgba(255, 255, 255, 0.8)",
      },
      zIndex: {
        base: "0",
        card: "10",
        floating: "20",
        navbar: "30",
        dropdown: "40",
        modal: "50",
        toast: "60",
      },
      animation: {
        "spin-slow": "spin 16s linear infinite",
        "loading-bar": "loading 2.5s ease-in-out infinite",
        "float-slow": "float 8s ease-in-out infinite",
        "pulse-subtle": "pulseSubtle 4s ease-in-out infinite",
      },
      keyframes: {
        loading: {
          "0%": { transform: "translateX(-100%)" },
          "50%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(100%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        pulseSubtle: {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "0.85", transform: "scale(1.03)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
