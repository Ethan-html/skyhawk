/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",

  content: [
    "./public/**/*.html",
    "./public/assets/js/**/*.js"
  ],
  safelist: [
    // Layout / positioning
    "relative","absolute","left-0","right-4","top-1/2","top-full",
    "z-30","w-full","w-max","min-w-full","h-full","h-12","h-16",
    "mx-auto",

    // Flex / display
    "flex","hidden","items-center","items-stretch","justify-between","justify-center",
    "gap-2","gap-2.5",

    // Spacing
    "px-2","px-3","px-4","px-6","px-8",
    "py-2","py-3",

    // Typography
    "text-xs","text-sm","text-base","text-lg","text-xl",
    "font-semibold","uppercase","tracking-wide",
    "text-white","text-white/90","text-white/95",

    // Backgrounds
    "bg-gradient-to-r",
    "from-capNavy","via-capBlue","to-primary",
    "bg-white/10",
    "bg-slate-900/95",

    // Borders
    "border","border-b","border-t-2",
    "border-transparent","border-capBorder/30","border-white/10",

    // Effects
    "shadow-nav",
    "rounded","rounded-b-xl",
    "backdrop-blur-sm",

    // Transforms
    "-translate-y-1/2",
    "translate-y-[5px]",
    "scale-95","scale-110",

    // SVG sizing
    "h-4","w-4","h-[42px]","w-[42px]",

    // Interaction / states
    "cursor-pointer",
    "overflow-hidden",
    "pointer-events-none",
    "opacity-0",

    // Transitions
    "transition-all","transition-colors","transition-transform",
    "duration-150","duration-200","duration-300",

    // Hover / focus / active
    "hover:bg-white/10",
    "hover:text-white",
    "hover:border-accent",
    "hover:scale-110",
    "hover:fill-transparent",
    "hover:stroke-white",
    "hover:stroke-[4]",
    "hover:fill-[tomato]",

    "focus:outline-none",
    "focus:ring-2",
    "focus:ring-accent/60",
    "focus:ring-accent/70",

    "active:scale-95",

    // Group hover (desktop logout icon)
    "group-hover:fill-transparent",
    "group-hover:stroke-white",
    "group-hover:stroke-[4]",
    "group-hover:fill-[tomato]",

    // Responsive
    "md:hidden","md:flex",
    "lg:px-8",

    // Arbitrary breakpoints
    "max-[998px]:flex",
    "max-[1250px]:px-4","max-[1250px]:text-base",
    "max-[1165px]:px-3","max-[1165px]:text-sm",
    "max-[840px]:px-2","max-[840px]:text-xs",

    // Misc arbitrary
    "max-w-[1680px]",
    "[webkit-tap-highlight-color:transparent]",
     // Positioning / layout
    "fixed","inset-y-0","inset-0","left-0","z-50",

    // Sizing
    "w-full","h-full","h-14","w-14","w-2","h-2",

    // Flex (some already exist, but safe to include if missing)
    "flex-col",

    // Spacing
    "pl-4","px-5",

    // Typography
    "font-normal",
    "leading-[1.375rem]",

    // Background colors (arbitrary → MUST safelist)
    "bg-[#1e3a8a]",
    "bg-[#0E3C9C]",
    "bg-[#0A2D75]",
    "bg-[#0C3385]",
    "hover:bg-[#0E3A9C]",

    // Borders
    "border-b-2",
    "border-l-2",
    "border-r-2",
    "border-white/20",
    "border-white",

    // Effects
    "shadow-drawer",

    // Transforms
    "rotate-45",

    // Transitions / easing
    "ease-in-out",
    "ease-out",

      // Body / layout
    "min-h-screen","flex-col","overflow-x-hidden","overflow-hidden","flex-1",

    // Backgrounds (arbitrary + dark)
    "bg-bgLight","bg-bgDark",
    "bg-[#1e3a8a]","bg-[#0E3C9C]","bg-[#0A2D75]","bg-[#0C3385]",
    "bg-[#BA0C2F]",
    "hover:bg-[#0E3A9C]",

    // Slate / gray colors used everywhere
    "bg-slate-100","bg-slate-100/95","bg-slate-900/95","bg-slate-950/95",
    "bg-black/20",
    "text-slate-800","text-slate-100",

    // Dark mode (BIG missing piece)
    "dark:bg-bgDark",
    "dark:text-slate-100",
    "dark:bg-gray-900",
    "dark:bg-slate-950",
    "dark:bg-slate-900/80",
    "dark:bg-slate-900/85",
    "dark:bg-slate-950/70",
    "dark:bg-gray-700",
    "dark:bg-blue-700/60",

    "dark:text-gray-300",
    "dark:text-gray-400",
    "dark:text-blue-400/80",

    "dark:border-gray-700",
    "dark:border-slate-700",
    "dark:border-slate-700/80",

    "dark:shadow-black/20",
    "dark:shadow-black/30",
    "dark:hover:border-slate-500",

    // Backdrop / blur
    "backdrop-blur","backdrop-blur-md",

    // Header specific
    "max-w-7xl","py-2",
    "ml-8",
    "object-contain",

    // Arbitrary sizes (VERY important)
    "w-[350px]","w-[300px]","w-[120px]",
    "left-[3px]","top-[3px]",

    // Filters (you were missing ALL of these)
    "dark:filter",
    "dark:brightness-200",
    "dark:contrast-150",
    "dark:saturate-200",
    "dark:hue-rotate-200",

    // Borders
    "border-white/20","border-slate-200/80",

    // Shadows
    "shadow-sm","shadow-xl",
    "shadow-slate-900/5","shadow-slate-900/10",

    // Grid/content (affects layout shift)
    "grid","grid-cols-1","gap-6",
    "sm:grid-cols-2","lg:grid-cols-3",

    // Card styling
    "rounded-2xl","rounded-xl",
    "bg-white/90",
    "p-6","lg:p-10",

    // Hover transforms (cards)
    "hover:-translate-y-1",
    "group-hover:scale-[1.01]",

    // Focus-visible (you were missing this)
    "focus-visible:ring-2",
    "focus-visible:ring-accent/70",

    // Transition extras
    "transition",

    // Toggle switch (footer)
    "w-14","h-7","w-5","h-5",
    "left-1.5","right-1.5",
    "p-[3px]",

    // Text colors
    "text-gray-700","text-gray-500",

    // Misc
    "underline","normal-case"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#001489",
        accent: "#ba0c2f",
        bgLight: "#f4f6f8",
        bgDark: "#0f1115",

        // merged + resolved
        capNavy: "#0B1E6D",
        capBlue: "#1238A8",
        capBlueSoft: "#1E4BC2",
        capSurface: "#0F2F92",
        capBorder: "#335BBE",
        capGold: "#FFCC00",

        skyhawk: {
          50: "#f6f8fb",
          100: "#eef2f8",
          200: "#d9e3f0",
          300: "#b8cadd",
          400: "#8ca9c6",
          500: "#5e84af",
          600: "#456892",
          700: "#344f73",
          800: "#263a56",
          900: "#17243a"
        }
      },

      fontFamily: {
        heading: ["Ubuntu", "Helvetica", "sans-serif"]
      },

      fontSize: {
        h4: ["1.25rem", { lineHeight: "1.375em" }]
      },

      letterSpacing: {
        tightish: "0.01em"
      },

      boxShadow: {
        nav: "0 12px 28px -18px rgba(6, 17, 61, 0.65)",
        drawer: "8px 0 32px -18px rgba(4, 9, 32, 0.75)",
        glow: "0 24px 80px rgba(23, 36, 58, 0.18)"
      }
    }
  },

  plugins: [],
};