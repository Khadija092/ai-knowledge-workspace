import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center",
        className,
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-xl bg-selected text-primary">
        {icon}
      </div>
      <h2 className="mt-4 text-xl font-semibold text-foreground">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-secondary">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
