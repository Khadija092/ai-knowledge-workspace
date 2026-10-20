import { Suspense } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { WorkspaceProvider } from "@/features/workspace/workspace-provider";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WorkspaceProvider>
      <Suspense fallback={<div className="h-full bg-background" />}>
        <AppShell>{children}</AppShell>
      </Suspense>
    </WorkspaceProvider>
  );
}
