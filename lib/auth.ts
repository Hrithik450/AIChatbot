import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import { redirect } from "next/navigation";
import { TSignInSchema } from "./db/zodSchema";
import { UsersService } from "@/actions/users/users.service";
import Credentials from "next-auth/providers/credentials";

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const { email, password } = credentials as TSignInSchema;

        const response = await UsersService.getUserByEmail(email);
        if (!response.success || !response.data) return null;

        const user = response.data;
        const isMatch = await bcrypt.compare(password, user.password);

        if (email === user.email && isMatch) {
          return { id: user.id, email: user.email };
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
});
