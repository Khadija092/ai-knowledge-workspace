import type { Document } from "@/types/document";

export const mockDocuments: Document[] = [
  {
    id: "doc-research",
    title: "Research",
    filename: "Research.pdf",
    type: "PDF",
    sizeBytes: 2.4 * 1024 * 1024,
    uploadedAt: "2026-10-18T09:30:00.000Z",
    status: "ready",
    pageCount: 38,
    passages: [
      {
        page: 12,
        text: "Revenue increased by 18% compared with the previous reporting period, driven by expansion in existing accounts.",
      },
    ],
  },
  {
    id: "doc-plan",
    title: "Project Plan",
    filename: "Project Plan.pdf",
    type: "PDF",
    sizeBytes: 1.8 * 1024 * 1024,
    uploadedAt: "2026-10-17T14:10:00.000Z",
    status: "ready",
    pageCount: 12,
    passages: [
      {
        page: 3,
        text: "The rollout is sequenced into discovery, pilot, and full deployment, with a review at the end of each stage.",
      },
    ],
  },
  {
    id: "doc-annual",
    title: "Annual Report",
    filename: "Annual Report.pdf",
    type: "PDF",
    sizeBytes: 3.2 * 1024 * 1024,
    uploadedAt: "2026-10-16T11:00:00.000Z",
    status: "processing",
    pageCount: 46,
  },
  {
    id: "doc-q3",
    title: "Q3 Summary",
    filename: "Q3 Summary.pdf",
    type: "PDF",
    sizeBytes: 890 * 1024,
    uploadedAt: "2026-10-15T16:45:00.000Z",
    status: "failed",
    error: "We couldn't extract text from this PDF. Try the file again.",
  },
  {
    id: "doc-market",
    title: "Market Notes",
    filename: "Market Notes.pdf",
    type: "PDF",
    sizeBytes: 1.1 * 1024 * 1024,
    uploadedAt: "2026-10-14T08:20:00.000Z",
    status: "ready",
    pageCount: 8,
    passages: [
      {
        page: 2,
        text: "Customer growth was concentrated in three regions, while retention stayed above the prior-year baseline.",
      },
    ],
  },
];
