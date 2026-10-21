import "server-only";

import { extractText, getDocumentProxy } from "unpdf";
import type { DocumentPassage } from "@/types/document";

const passageLimit = 40;
const passageLength = 900;

export async function extractPassages(bytes: Uint8Array) {
  const pdf = await getDocumentProxy(bytes);
  const extracted = await extractText(pdf, { mergePages: false });
  const pages = Array.isArray(extracted.text) ? extracted.text : [extracted.text];
  const passages: DocumentPassage[] = pages
    .map((text, index) => ({
      page: index + 1,
      text: text.replace(/\s+/g, " ").trim().slice(0, passageLength),
    }))
    .filter((passage) => passage.text.length > 0)
    .slice(0, passageLimit);

  return {
    pageCount: extracted.totalPages || pages.length,
    passages,
  };
}
