import { cn } from "@/lib/utils";

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary/20",
        className,
      )}
      {...props}
    />
  );
}
