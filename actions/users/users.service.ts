import { UsersModel } from "./users.model";
import { userSchema } from "./users.types";
import type { User, UserResponse, UsersResponse } from "./users.types";

export class UsersService {
  static async createUser(data: Partial<User>): Promise<UserResponse> {
    try {
      const validatedData = userSchema.parse(data);

      const existingUser = await UsersModel.getUserByEmail(validatedData.email);
      if (existingUser) {
        return {
          success: false,
          error: "User with this email already exists",
        };
      }

      const user = await UsersModel.createUser(validatedData);
      return {
        success: true,
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create user",
      };
    }
  }

  static async getUserById(userId: string): Promise<UserResponse> {
    try {
      const user = await UsersModel.getUserById(userId);
      if (!user) {
        return {
          success: false,
          error: "User not found",
        };
      }
      return {
        success: true,
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get user",
      };
    }
  }

  static async getUserByEmail(email: string): Promise<UserResponse> {
    try {
      const user = await UsersModel.getUserByEmail(email);
      if (!user) {
        return {
          success: false,
          error: "User not found",
        };
      }
      return {
        success: true,
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get user",
      };
    }
  }

  static async getChatsByUserId(id: string) {
    try {
      const chats = await UsersModel.getChatsByUserId(id);
      return {
        success: true,
        data: chats,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get chats",
      };
    }
  }

  static async updateUser(
    userId: string,
    data: Partial<User>
  ): Promise<UserResponse> {
    try {
      const validatedData = userSchema.partial().parse(data);

      const user = await UsersModel.updateUser(userId, validatedData);
      if (!user) {
        return {
          success: false,
          error: "User not found",
        };
      }
      return {
        success: true,
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update user",
      };
    }
  }

  static async deleteUser(userId: string): Promise<UserResponse> {
    try {
      const success = await UsersModel.deleteUser(userId);
      if (!success) {
        return {
          success: false,
          error: "User not found",
        };
      }
      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete user",
      };
    }
  }
}
