import { MessagesModel } from "./messages.model";
import {
  Message,
  MessageResponse,
  messageSchema,
  MessagesResponse,
} from "./messages.types";

export class MessagesService {
  static async createMessage(data: Partial<Message>): Promise<MessageResponse> {
    try {
      const validatedData = messageSchema.parse(data);

      const message = await MessagesModel.createMessage(validatedData);
      return {
        success: true,
        data: message,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create message",
      };
    }
  }

  static async getMessageById(id: string): Promise<MessageResponse> {
    try {
      const message = await MessagesModel.getMessageById(id);
      if (!message) {
        return {
          success: false,
          error: "Message not found",
        };
      }
      return {
        success: true,
        data: message,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get message",
      };
    }
  }

  static async getMessagesByChatId(chatId: string): Promise<MessagesResponse> {
    try {
      const messages = await MessagesModel.getMessageByChatId(chatId);
      return {
        success: true,
        data: messages,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to list messages",
      };
    }
  }

  static async deleteMessagesByChatId(
    chatId: string
  ): Promise<MessageResponse> {
    try {
      const success = await MessagesModel.deleteMessagesByChatId(chatId);
      if (!success) {
        return {
          success: false,
          error: "Messages not found",
        };
      }
      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to delete messages",
      };
    }
  }
}
