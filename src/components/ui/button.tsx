import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";
type ButtonSize = "md" | "sm" | "icon";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white shadow-sm shadow-primary/25 hover:bg-primary-hover",
  secondary: "border border-border bg-card text-foreground shadow-sm hover:bg-background",
  ghost: "text-secondary hover:bg-selected hover:text-foreground",
  destructive: "bg-destructive text-white shadow-sm hover:bg-[#be123c]",
};

const sizes: Record<ButtonSize, string> = {
  md: "h-11 px-4",
  sm: "h-9 px-3",
  icon: "size-10",
};

export function buttonClassName(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className?: string,
) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    className,
  );
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClassName(variant, size, className)}
      {...props}
    />
  );
}
