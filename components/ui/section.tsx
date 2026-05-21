import { wgTokens } from "@/lib/tokens";

type SectionProps = {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  headerClassName?: string;
};

export function Section({
  children,
  title,
  subtitle,
  className = "",
  headerClassName = "",
}: SectionProps) {
  return (
    <section className={className}>
      {(title || subtitle) && (
        <header
          className={[
            "border-b border-orange-50 pb-4 lg:pb-5",
            headerClassName,
          ].join(" ")}
        >
          {title && <h2 className={wgTokens.typography.h2}>{title}</h2>}
          {subtitle && (
            <p className="mt-1 text-xs text-stone-500">{subtitle}</p>
          )}
        </header>
      )}
      {children}
    </section>
  );
}
