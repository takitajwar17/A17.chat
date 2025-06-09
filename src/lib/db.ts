import { Chat, StoredMessage } from "@/types/database";
import Dexie, { Table } from "dexie";
import { nanoid } from "nanoid";

class ChatDatabase extends Dexie {
  chats!: Table<Chat>;
  messages!: Table<StoredMessage>;

  constructor() {
    super("ChatDatabase");
    this.version(2).stores({
      chats: "id, created_at, updated_at, branchedFromChatId",
      messages: "id, chatId, created_at",
    });
  }

  async createChat(title?: string, branchedFromChatId?: string): Promise<Chat> {
    const chat: Chat = {
      id: nanoid(),
      title,
      created_at: new Date(),
      updated_at: new Date(),
      branchedFromChatId,
    };

    await this.chats.add(chat);
    return chat;
  }

  async updateChatTitle(chatId: string, title: string): Promise<void> {
    await this.chats.update(chatId, {
      title,
      updated_at: new Date(),
    });
  }

  async addMessage(message: Omit<StoredMessage, "id" | "created_at">): Promise<StoredMessage> {
    const storedMessage: StoredMessage = {
      ...message,
      id: nanoid(),
      created_at: new Date(),
    };

    await this.messages.add(storedMessage);
    await this.chats.update(message.chatId, {
      updated_at: new Date(),
    });

    return storedMessage;
  }

  async getChatMessages(chatId: string): Promise<StoredMessage[]> {
    return await this.messages.where("chatId").equals(chatId).sortBy("created_at");
  }

  async getChats(): Promise<Chat[]> {
    return await this.chats.orderBy("updated_at").reverse().toArray();
  }

  async deleteChat(chatId: string): Promise<void> {
    await this.transaction("rw", this.chats, this.messages, async () => {
      await this.messages.where("chatId").equals(chatId).delete();
      await this.chats.delete(chatId);
    });
  }

  /**
   * Creates a new chat by branching from an existing chat at a specific message index
   * Copies all messages up to and including the specified message index
   * @param originalChatId - ID of the chat to branch from
   * @param branchFromMessageIndex - Index of the last message to include (0-based, inclusive)
   * @param newTitle - Optional title for the new branched chat
   * @returns Promise containing the new chat and copied message count
   */
  async branchChat(
    originalChatId: string, 
    branchFromMessageIndex: number, 
    newTitle?: string
  ): Promise<{ newChat: Chat; messageCount: number }> {
    try {
      console.log(`[DB] Starting branch operation from chat ${originalChatId} at message index ${branchFromMessageIndex}`);
      
      return await this.transaction("rw", this.chats, this.messages, async () => {
        // Get original chat to verify it exists
        const originalChat = await this.chats.get(originalChatId);
        if (!originalChat) {
          throw new Error(`Original chat with ID ${originalChatId} not found`);
        }

        // Get all messages from the original chat in chronological order
        const originalMessages = await this.getChatMessages(originalChatId);
        
        if (originalMessages.length === 0) {
          throw new Error("Cannot branch from a chat with no messages");
        }

        if (branchFromMessageIndex < 0 || branchFromMessageIndex >= originalMessages.length) {
          throw new Error(`Invalid message index: ${branchFromMessageIndex}. Chat has ${originalMessages.length} messages.`);
        }

        // Validate that we're branching from a valid conversation point
        const messageAtIndex = originalMessages[branchFromMessageIndex];
        if (messageAtIndex.role !== "assistant") {
          console.warn(`[DB] Warning: Branching from ${messageAtIndex.role} message instead of assistant message`);
          console.warn(`[DB] This may result in an incomplete conversation flow`);
        }

        // Copy messages up to and including the specified index
        const messagesToCopy = originalMessages.slice(0, branchFromMessageIndex + 1);
        
        // Validate conversation flow before copying
        console.log(`[DB] Validating conversation flow for ${messagesToCopy.length} messages`);
        let consecutiveRoleIssues = 0;
        
        for (let i = 1; i < messagesToCopy.length; i++) {
          const currentMessage = messagesToCopy[i];
          const previousMessage = messagesToCopy[i - 1];
          
          // Check for consecutive messages of the same role (should alternate user/assistant)
          if (currentMessage.role === previousMessage.role) {
            console.warn(`[DB] Flow issue: Found consecutive ${currentMessage.role} messages at index ${i - 1} and ${i}`);
            consecutiveRoleIssues++;
          }
        }
        
        if (consecutiveRoleIssues > 0) {
          console.warn(`[DB] Warning: Found ${consecutiveRoleIssues} conversation flow issues, but proceeding with branch`);
        } else {
          console.log(`[DB] Conversation flow validation passed - proper user/assistant alternation`);
        }

        // Create the new branched chat
        const branchTitle = newTitle || `Branch from ${originalChat.title || 'Untitled Chat'}`;
        const newChat: Chat = {
          id: nanoid(),
          title: branchTitle,
          created_at: new Date(),
          updated_at: new Date(),
          branchedFromChatId: originalChatId,
        };

        await this.chats.add(newChat);
        console.log(`[DB] Created new branched chat ${newChat.id} with title: ${branchTitle}`);

        // Copy messages up to and including the specified index
        const newMessages: StoredMessage[] = [];

        // Preserve original timestamps and order to maintain conversation flow
        for (let i = 0; i < messagesToCopy.length; i++) {
          const originalMessage = messagesToCopy[i];
          const newMessage: StoredMessage = {
            id: nanoid(),
            chatId: newChat.id,
            content: originalMessage.content,
            role: originalMessage.role,
            created_at: originalMessage.created_at, // Keep original timestamp to preserve order
            isPartial: originalMessage.isPartial,
          };
          
          newMessages.push(newMessage);
          console.log(`[DB] Copying message ${i}: ${originalMessage.role} - "${originalMessage.content.slice(0, 50)}..."`);
        }

        // Bulk insert all copied messages in order
        if (newMessages.length > 0) {
          await this.messages.bulkAdd(newMessages);
          console.log(`[DB] Successfully copied ${newMessages.length} messages to branched chat in correct order`);
          
          // Verify the conversation flow
          const userMessages = newMessages.filter(m => m.role === "user").length;
          const assistantMessages = newMessages.filter(m => m.role === "assistant").length;
          console.log(`[DB] Branch contains ${userMessages} user messages and ${assistantMessages} assistant messages`);
        }

        // Update the new chat's updated_at timestamp
        await this.chats.update(newChat.id, {
          updated_at: new Date(),
        });

        console.log(`[DB] Branch operation completed successfully with preserved conversation order`);
        return { newChat, messageCount: newMessages.length };
      });
    } catch (error) {
      console.error(`[DB] Error branching chat:`, error);
      throw error;
    }
  }

  /**
   * Gets all chats that were branched from the specified chat
   * @param originalChatId - ID of the original chat
   * @returns Promise containing array of branched chats
   */
  async getBranchedChats(originalChatId: string): Promise<Chat[]> {
    try {
      return await this.chats
        .where("branchedFromChatId")
        .equals(originalChatId)
        .sortBy("created_at");
    } catch (error) {
      console.error(`[DB] Error getting branched chats:`, error);
      return [];
    }
  }

  /**
   * Gets the original chat that this chat was branched from (if any)
   * @param chatId - ID of the potentially branched chat
   * @returns Promise containing the original chat or null
   */
  async getOriginalChat(chatId: string): Promise<Chat | null> {
    try {
      const chat = await this.chats.get(chatId);
      if (!chat?.branchedFromChatId) {
        return null;
      }
      
      return await this.chats.get(chat.branchedFromChatId) || null;
    } catch (error) {
      console.error(`[DB] Error getting original chat:`, error);
      return null;
    }
  }
}

export const db = new ChatDatabase();
