import { ChatsModel } from "./chats.model";
import { Chat, ChatResponse, chatSchema, ChatsResponse } from "./chats.types";

export class ChatsService {
  static async createChat(data: Partial<Chat>): Promise<ChatResponse> {
    try {
      const validatedData = chatSchema.parse(data);

      const chat = await ChatsModel.createChat(validatedData);
      return {
        success: true,
        data: chat,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create chat",
      };
    }
  }

  static async getChatById(id: string): Promise<ChatResponse> {
    try {
      const chat = await ChatsModel.getChatById(id);
      if (!chat) {
        return {
          success: false,
          error: "Chat not found",
        };
      }
      return {
        success: true,
        data: chat,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get chat",
      };
    }
  }

  static async updateChat(
    id: string,
    data: Partial<Chat>
  ): Promise<ChatResponse> {
    try {
      const validatedData = chatSchema.partial().parse(data);

      const chat = await ChatsModel.updateChat(id, validatedData);
      if (!chat) {
        return {
          success: false,
          error: "Chat not found",
        };
      }
      return {
        success: true,
        data: chat,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update chat",
      };
    }
  }

  static async deleteChat(id: string): Promise<ChatResponse> {
    try {
      const success = await ChatsModel.deleteChat(id);
      if (!success) {
        return {
          success: false,
          error: "Chat not found",
        };
      }
      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete chat",
      };
    }
  }

  static async listChats(): Promise<ChatsResponse> {
    try {
      const chats = await ChatsModel.listChats();
      return {
        success: true,
        data: chats,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to list chats",
      };
    }
  }
}
