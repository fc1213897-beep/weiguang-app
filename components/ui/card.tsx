import { wgTokens } from "@/lib/tokens";

type CardProps = {
  children: React.ReactNode;
  className?: string;
  variant?: "panel" | "inner";
};

export function Card({ children, className = "", variant = "panel" }: CardProps) {
  const base =
    variant === "panel"
      ? [
          wgTokens.motion.panelHover,
          wgTokens.radius.md,
          "bg-white shadow-sm sm:rounded-3xl",
          wgTokens.spacing.panel,
        ].join(" ")
      : [
          wgTokens.motion.innerHover,
          wgTokens.radius.md,
          wgTokens.colors.accent,
          "sm:rounded-3xl",
        ].join(" ");

  return (
    <div
      className={[
        "min-w-0 max-w-full overflow-hidden transition-[transform,box-shadow]",
        base,
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
