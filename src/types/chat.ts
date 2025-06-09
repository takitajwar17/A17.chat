import { ModelId } from "./models";

export interface PersistentChatOptions {
  id?: string;
  model: ModelId;
}

export interface ChatBody {
  model: ModelId;
  systemPromptId: string;
  messages: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  content: string;
  role: "user" | "assistant" | "system";
}

/**
 * Interface for chat branching response data
 */
export interface BranchChatResponse {
  newChatId: string;
  branchedChat: {
    id: string;
    title?: string;
    created_at: string;
    branchedFromChatId: string;
  };
  messageCount: number;
}
