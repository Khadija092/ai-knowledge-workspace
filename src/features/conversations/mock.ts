import { workspaceNow } from "@/features/conversations/clock";
import type { Conversation } from "@/types/chat";

function hoursAgo(hours: number) {
  return new Date(workspaceNow.getTime() - hours * 60 * 60 * 1000).toISOString();
}

export const mockConversations: Conversation[] = [
  {
    id: "conv-research",
    title: "Research summary",
    updatedAt: hoursAgo(2),
    documentIds: ["doc-research"],
    messages: [
      {
        id: "msg-research-user",
        role: "user",
        status: "complete",
        content: "Summarize the key findings in the research report.",
      },
      {
        id: "msg-research-ai",
        role: "assistant",
        status: "complete",
        content:
          "The research report identifies revenue growth as the lead finding.\n\n- Revenue increased by 18% compared with the previous reporting period [1].",
        citations: [
          {
            label: "1",
            documentId: "doc-research",
            documentName: "Research.pdf",
            page: 12,
            excerpt:
              "Revenue increased by 18% compared with the previous reporting period, driven by expansion in existing accounts.",
          },
        ],
      },
    ],
  },
  {
    id: "conv-requirements",
    title: "Project requirements",
    updatedAt: hoursAgo(26),
    documentIds: ["doc-plan", "doc-research"],
    messages: [
      {
        id: "msg-requirements-user",
        role: "user",
        status: "complete",
        content: "Compare the requirements across the project plan and research notes.",
      },
      {
        id: "msg-requirements-ai",
        role: "assistant",
        status: "complete",
        content:
          "The plan breaks delivery into discovery, pilot, and deployment, while the research notes explain the commercial result those stages are meant to support [1].",
        citations: [
          {
            label: "1",
            documentId: "doc-plan",
            documentName: "Project Plan.pdf",
            page: 3,
            excerpt:
              "The rollout is sequenced into discovery, pilot, and full deployment, with a review at the end of each stage.",
          },
        ],
      },
    ],
  },
  {
    id: "conv-annual",
    title: "Annual report analysis",
    updatedAt: hoursAgo(24 * 4),
    documentIds: ["doc-market"],
    messages: [
      {
        id: "msg-annual-user",
        role: "user",
        status: "complete",
        content: "What does the market notes file say about customer growth?",
      },
      {
        id: "msg-annual-ai",
        role: "assistant",
        status: "complete",
        content:
          "Customer growth was concentrated in three regions, and retention stayed above the prior-year baseline [1].",
        citations: [
          {
            label: "1",
            documentId: "doc-market",
            documentName: "Market Notes.pdf",
            page: 2,
            excerpt:
              "Customer growth was concentrated in three regions, while retention stayed above the prior-year baseline.",
          },
        ],
      },
    ],
  },
];
