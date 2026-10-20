import { cn } from "@/lib/utils";
import type { DocumentStatus } from "@/types/document";

const styles: Record<DocumentStatus, string> = {
  ready: "text-success",
  processing: "text-warning",
  failed: "text-destructive",
};

const labels: Record<DocumentStatus, string> = {
  ready: "Ready",
  processing: "Processing",
  failed: "Failed",
};

export function DocumentStatusBadge({ status }: { status: DocumentStatus }) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-[13px] font-medium", styles[status])}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {labels[status]}
    </span>
  );
}
