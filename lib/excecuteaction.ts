"use client";
import { isRedirectError } from "next/dist/client/components/redirect-error";

type Request<T> = {
  actionFn: () => Promise<T>;
  successMessage: string;
};

type Response = {
  success: boolean;
  message: string;
};

export const excecuteAction = async <T>({
  actionFn,
  successMessage = "The action was successfull",
}: Request<T>): Promise<Response> => {
  try {
    await actionFn();

    return {
      success: true,
      message: successMessage,
    };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      success: false,
      message: "An error has occurred during executing the action",
    };
  }
};
