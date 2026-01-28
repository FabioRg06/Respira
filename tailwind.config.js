/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        border: "#eaeae8",
        input: "#eaeae8",
        ring: "#a85a3a",
        background: "#fefdfb",
        foreground: "#3d2a2a",
        primary: {
          DEFAULT: "#a85a3a",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#f2f2f0",
          foreground: "#3d2a2a",
        },
        destructive: {
          DEFAULT: "#dc2626",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#f5f5f3",
          foreground: "#7f6a6a",
        },
        red: {
          500: "#ef4444",
        },
        orange: {
          400: "#fb923c",
        },
        accent: {
          DEFAULT: "#e8e0d0",
          foreground: "#3d2a2a",
        },
        popover: {
          DEFAULT: "#ffffff",
          foreground: "#3d2a2a",
        },
        card: {
          DEFAULT: "#ffffff",
          foreground: "#3d2a2a",
        },
        sidebar: {
          DEFAULT: "#fefefe",
          foreground: "#1a1a1a",
          primary: "#333333",
          "primary-foreground": "#fefefe",
          accent: "#f5f5f5",
          "accent-foreground": "#333333",
          border: "#e5e5e5",
          ring: "#b3b3b3",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["PlayfairDisplay_400Regular"],
        "serif-bold": ["PlayfairDisplay_700Bold"],
        mono: ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
