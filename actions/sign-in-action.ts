import { signIn } from "@/lib/auth";
import { TSignInSchema } from "@/schemas/auth";

export async function signInAction(data: TSignInSchema) {
  await signIn("credentials", data);
}
