type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "soft";
  fullWidth?: boolean;
};

export function Button({
  children,
  className = "",
  variant = "primary",
  fullWidth = false,
  ...props
}: ButtonProps) {
  const styles =
    variant === "primary"
      ? "bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-60"
      : "bg-orange-100/90 text-amber-800 ring-1 ring-amber-200/50 hover:bg-amber-200/80";

  return (
    <button
      type="button"
      className={[
        "shrink-0 rounded-2xl px-4 py-2.5 text-sm font-medium transition",
        "duration-[450ms]",
        styles,
        fullWidth ? "w-full" : "",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}
