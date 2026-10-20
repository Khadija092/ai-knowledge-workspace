"use client";

import { useMemo, useState } from "react";
import { FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import {
  formatFileSize,
  isPdfFile,
  MAX_UPLOAD_BYTES,
} from "@/features/documents";
import { useWorkspace } from "@/features/workspace/workspace-provider";

type SelectedFile = {
  id: string;
  file: File;
  error?: string;
};

export function UploadDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { addUploadedFiles } = useWorkspace();
  const [files, setFiles] = useState<SelectedFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const [phase, setPhase] = useState<"select" | "uploading" | "success">("select");
  const [progress, setProgress] = useState(0);

  const validFiles = useMemo(
    () => files.filter((item) => !item.error).map((item) => item.file),
    [files],
  );

  function resetAndClose() {
    setFiles([]);
    setPhase("select");
    setProgress(0);
    onClose();
  }

  function addFiles(list: FileList | File[]) {
    const next = Array.from(list).map((file) => {
      if (!isPdfFile(file)) {
        return { id: crypto.randomUUID(), file, error: "Only PDF files can be uploaded." };
      }
      if (file.size > MAX_UPLOAD_BYTES) {
        return { id: crypto.randomUUID(), file, error: "This file is larger than 10 MB." };
      }
      return { id: crypto.randomUUID(), file };
    });
    setFiles((current) => [...current, ...next]);
  }

  function startUpload() {
    if (validFiles.length === 0) {
      return;
    }
    setPhase("uploading");
    setProgress(12);
    const timer = window.setInterval(() => {
      setProgress((current) => {
        if (current >= 100) {
          window.clearInterval(timer);
          return 100;
        }
        return Math.min(100, current + 22);
      });
    }, 180);
    window.setTimeout(() => {
      window.clearInterval(timer);
      setProgress(100);
      addUploadedFiles(validFiles);
      setPhase("success");
    }, 900);
  }

  return (
    <Dialog
      open={open}
      title="Upload documents"
      description="Add files to your knowledge library."
      onClose={resetAndClose}
      className="sm:max-w-xl"
    >
      {phase === "success" ? (
        <div className="flex flex-col gap-5">
          <p className="rounded-xl border border-border bg-background px-4 py-4 text-sm text-secondary">
            Your document was uploaded successfully. We&apos;re preparing it for
            AI-powered search.
          </p>
          <div className="flex justify-end">
            <Button onClick={resetAndClose}>Done</Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <label
            className={`flex cursor-pointer flex-col items-center rounded-xl border border-dashed px-6 py-10 text-center ${
              dragging ? "border-primary bg-selected" : "border-border bg-background"
            }`}
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              addFiles(event.dataTransfer.files);
            }}
          >
            <span className="flex size-11 items-center justify-center rounded-full bg-card text-primary">
              <Upload className="size-5" aria-hidden />
            </span>
            <span className="mt-4 text-sm font-medium text-foreground">
              Drag and drop your files here
            </span>
            <span className="mt-1 text-[13px] text-secondary">
              or browse files from your computer
            </span>
            <span className="mt-4 inline-flex h-9 items-center rounded-lg bg-primary px-3 text-sm font-medium text-white">
              Browse files
            </span>
            <input
              type="file"
              accept="application/pdf,.pdf"
              multiple
              className="sr-only"
              onChange={(event) => {
                if (event.target.files) {
                  addFiles(event.target.files);
                }
                event.target.value = "";
              }}
            />
          </label>
          <p className="text-[13px] text-secondary">
            Supported formats: PDF. Maximum file size: 10 MB.
          </p>
          {files.length > 0 ? (
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium">Selected files</h3>
              <ul className="flex flex-col gap-2">
                {files.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-3 rounded-lg border border-border px-3 py-3"
                  >
                    <FileText className="size-4 shrink-0 text-primary" aria-hidden />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {item.file.name}
                      </span>
                      <span className="text-[13px] text-secondary">
                        {item.error ?? `${formatFileSize(item.file.size)} · Ready to upload`}
                      </span>
                    </span>
                    <button
                      type="button"
                      className="text-sm text-secondary hover:text-foreground"
                      onClick={() =>
                        setFiles((current) => current.filter((file) => file.id !== item.id))
                      }
                      aria-label={`Remove ${item.file.name}`}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {phase === "uploading" ? (
            <div>
              <div className="h-2 overflow-hidden rounded-full bg-background">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-2 text-[13px] text-secondary">Uploading {progress}%</p>
            </div>
          ) : null}
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={resetAndClose} disabled={phase === "uploading"}>
              Cancel
            </Button>
            <Button
              onClick={startUpload}
              disabled={validFiles.length === 0 || phase === "uploading"}
            >
              Upload files
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  );
}
