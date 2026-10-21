import { cn } from "@/lib/utils";
import type { DocumentStatus } from "@/types/document";

const styles: Record<DocumentStatus, string> = {
  ready: "bg-success/10 text-success",
  processing: "bg-warning/10 text-warning",
  failed: "bg-destructive/10 text-destructive",
};

const labels: Record<DocumentStatus, string> = {
  ready: "Ready",
  processing: "Processing",
  failed: "Failed",
};

export function DocumentStatusBadge({ status }: { status: DocumentStatus }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-2 rounded-full px-2.5 py-1 text-[13px] font-medium",
        styles[status],
      )}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {labels[status]}
    </span>
  );
}
