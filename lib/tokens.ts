/** 微光设计令牌：圆角、阴影、间距、动效、字体、色彩 */
export const wgTokens = {
  radius: {
    md: "rounded-2xl",
    lg: "rounded-3xl",
  },
  shadow: {
    panel: "shadow-sm",
    panelHover:
      "hover:shadow-[0_12px_32px_-12px_rgba(251,146,60,0.18),0_4px_16px_-6px_rgba(120,113,108,0.08)]",
    innerHover: "hover:shadow-[0_8px_24px_-10px_rgba(251,146,60,0.2)]",
  },
  spacing: {
    section: "mt-4 sm:mt-5",
    stack: "gap-3 sm:gap-4",
    panel: "p-4 sm:p-6",
  },
  motion: {
    duration: "0.45s",
    ease: "ease",
    pageIn: "wg-page-in",
    panelHover: "wg-panel-card",
    innerHover: "wg-inner-card",
    breathe: "wg-character-breathe",
  },
  typography: {
    brand: "text-xl font-bold tracking-tight text-orange-500 lg:text-2xl",
    h2: "text-xl font-bold text-stone-800 sm:text-2xl lg:text-[1.75rem] xl:text-3xl",
    h3: "text-lg font-bold text-stone-800",
    caption: "text-xs text-stone-400",
    body: "text-sm text-stone-600",
  },
  colors: {
    bg: "bg-[#FFF7ED]",
    primary: "text-orange-500",
    surface: "bg-white",
    accent: "bg-orange-50/80",
  },
} as const;

export const panelClass = [
  wgTokens.motion.panelHover,
  "min-w-0 max-w-full overflow-hidden",
  wgTokens.radius.md,
  wgTokens.colors.surface,
  wgTokens.spacing.panel,
  wgTokens.shadow.panel,
  "sm:rounded-3xl",
].join(" ");

export const innerCardClass = [
  wgTokens.motion.innerHover,
  wgTokens.radius.md,
  wgTokens.colors.accent,
  "sm:rounded-3xl",
].join(" ");
