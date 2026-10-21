import "server-only";

import { createSupabaseAdmin } from "@/lib/supabase";
import type { Conversation, Preferences } from "@/types/chat";
import type { Document } from "@/types/document";

const BUCKET = "knowledge";

export type StoredConversation = Conversation & {
  difyConversationId?: string;
};

const defaultPreferences: Preferences = {
  responseStyle: "detailed",
  prioritizeSelectedDocuments: true,
  startNewConversationsAutomatically: true,
};

let bucketReady: Promise<void> | null = null;

function ensureBucket() {
  bucketReady ??= (async () => {
    const supabase = createSupabaseAdmin();
    const existing = await supabase.storage.listBuckets();
    if (existing.error) {
      bucketReady = null;
      throw new Error(`Couldn't reach Supabase storage. ${existing.error.message}`);
    }
    if (existing.data?.some((bucket) => bucket.name === BUCKET)) {
      return;
    }
    const created = await supabase.storage.createBucket(BUCKET, { public: false });
    if (created.error && !/already exists/i.test(created.error.message)) {
      bucketReady = null;
      throw new Error(`Couldn't prepare storage. ${created.error.message}`);
    }
  })();

  return bucketReady;
}

function storage() {
  return createSupabaseAdmin().storage.from(BUCKET);
}

function missing(message: string) {
  return /not found|does not exist/i.test(message);
}

async function readJson<T>(path: string): Promise<T | null> {
  await ensureBucket();
  const { data, error } = await storage().download(path);
  if (error) {
    if (missing(error.message)) {
      return null;
    }
    throw new Error(`Couldn't read saved data. ${error.message}`);
  }
  return JSON.parse(await data.text()) as T;
}

async function writeJson(path: string, value: unknown) {
  await ensureBucket();
  const payload = Buffer.from(JSON.stringify(value));
  const { error } = await storage().upload(path, payload, {
    contentType: "application/json",
    upsert: true,
  });
  if (error) {
    throw new Error(`Couldn't save data. ${error.message}`);
  }
}

async function listJson(folder: string) {
  await ensureBucket();
  const { data, error } = await storage().list(folder, { limit: 100 });
  if (error) {
    if (missing(error.message)) {
      return [];
    }
    throw new Error(`Couldn't list saved data. ${error.message}`);
  }
  return (data ?? [])
    .map((item) => item.name)
    .filter((name) => name.endsWith(".json"));
}

export function isRecordId(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export async function listDocuments() {
  const names = await listJson("documents");
  const documents = await Promise.all(
    names.map((name) => readJson<Document>(`documents/${name}`)),
  );
  return documents
    .filter((document): document is Document => document !== null)
    .sort((left, right) => right.uploadedAt.localeCompare(left.uploadedAt));
}

export async function getDocument(id: string) {
  return readJson<Document>(`documents/${id}.json`);
}

export async function saveDocument(document: Document) {
  await writeJson(`documents/${document.id}.json`, document);
}

export async function removeDocumentRecord(id: string) {
  await ensureBucket();
  const { error } = await storage().remove([
    `documents/${id}.json`,
    `files/${id}.pdf`,
  ]);
  if (error && !missing(error.message)) {
    throw new Error(`Couldn't delete that document. ${error.message}`);
  }
}

export async function removeAllDocuments() {
  await ensureBucket();
  const documents = await listJson("documents");
  const pdfs = await storage().list("files", { limit: 100 });
  if (pdfs.error && !missing(pdfs.error.message)) {
    throw new Error(`Couldn't delete the documents. ${pdfs.error.message}`);
  }
  const paths = [
    ...documents.map((name) => `documents/${name}`),
    ...(pdfs.data ?? [])
      .map((item) => item.name)
      .filter((name) => name.endsWith(".pdf"))
      .map((name) => `files/${name}`),
  ];
  if (paths.length === 0) {
    return;
  }
  const { error } = await storage().remove(paths);
  if (error) {
    throw new Error(`Couldn't delete the documents. ${error.message}`);
  }
}

export async function savePdf(id: string, bytes: Uint8Array) {
  await ensureBucket();
  const { error } = await storage().upload(`files/${id}.pdf`, Buffer.from(bytes), {
    contentType: "application/pdf",
    upsert: true,
  });
  if (error) {
    throw new Error(`Couldn't store the PDF. ${error.message}`);
  }
}

export async function readPdf(id: string) {
  await ensureBucket();
  const { data, error } = await storage().download(`files/${id}.pdf`);
  if (error) {
    if (missing(error.message)) {
      return null;
    }
    throw new Error(`Couldn't open the PDF. ${error.message}`);
  }
  return new Uint8Array(await data.arrayBuffer());
}

export async function listConversations() {
  const names = await listJson("conversations");
  const conversations = await Promise.all(
    names.map((name) => readJson<StoredConversation>(`conversations/${name}`)),
  );
  return conversations
    .filter((conversation): conversation is StoredConversation => conversation !== null)
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

export async function getConversation(id: string) {
  return readJson<StoredConversation>(`conversations/${id}.json`);
}

export async function saveConversation(conversation: StoredConversation) {
  await writeJson(`conversations/${conversation.id}.json`, conversation);
}

export async function removeConversation(id: string) {
  await ensureBucket();
  const { error } = await storage().remove([`conversations/${id}.json`]);
  if (error && !missing(error.message)) {
    throw new Error(`Couldn't delete that conversation. ${error.message}`);
  }
}

export async function getPreferences() {
  const stored = await readJson<Preferences>("preferences.json");
  return stored ? { ...defaultPreferences, ...stored } : defaultPreferences;
}

export async function savePreferences(preferences: Preferences) {
  await writeJson("preferences.json", preferences);
}
