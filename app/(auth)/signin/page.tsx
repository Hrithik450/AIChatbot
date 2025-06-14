import { auth } from "@/lib/auth";
import { SignInForm } from "@/components/auth/sign-in-form";
import { redirect } from "next/navigation";

export default async function SignInPage() {
  const session = await auth();
  if (session) return redirect("/");

  return <SignInForm />;
}
