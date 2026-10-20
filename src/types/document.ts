export type DocumentStatus = "processing" | "ready" | "failed";

export type DocumentPassage = {
  page: number;
  text: string;
};

export type Document = {
  id: string;
  title: string;
  filename: string;
  type: "PDF";
  sizeBytes: number;
  uploadedAt: string;
  status: DocumentStatus;
  pageCount?: number;
  error?: string;
  passages?: DocumentPassage[];
};
