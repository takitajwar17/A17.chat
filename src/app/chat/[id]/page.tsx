import ChatInterface from "@/components/chat/ChatInterface";
import type { Metadata } from "next";

interface ChatPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "A17.chat",
};

export default async function ChatPage({ params }: ChatPageProps) {
  const { id } = await params;
  return (
    <div className="flex-1 h-full">
      <ChatInterface chatId={id} />
    </div>
  );
}
