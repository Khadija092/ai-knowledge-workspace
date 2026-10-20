import type { Metadata } from "next";
import { HistoryScreen } from "@/components/history/history-screen";

export const metadata: Metadata = {
  title: "Chat History",
};

export default function HistoryPage() {
  return <HistoryScreen />;
}
