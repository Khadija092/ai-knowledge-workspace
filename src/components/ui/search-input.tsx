import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

type SearchInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export function SearchInput({
  label = "Search",
  className,
  ...props
}: SearchInputProps) {
  return (
    <label className="relative block">
      <span className="sr-only">{label}</span>
      <Search
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted"
        aria-hidden
      />
      <input
        className={cn(
          "h-11 w-full rounded-lg border border-border bg-card pr-3 pl-10 text-sm text-foreground outline-none transition-colors placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20",
          className,
        )}
        {...props}
      />
    </label>
  );
}
