import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import { UsersService } from "@/actions/users/users.service";
import Credentials from "next-auth/providers/credentials";
import { signInSchema } from "../validations";

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const validatedFields = signInSchema.safeParse(credentials);
        if (!validatedFields.success) {
          return null;
        }

        const { email, password } = validatedFields.data;
        const response = await UsersService.getUserByEmail(email);

        if (!response.success || !response.data) {
          return null;
        }

        const user = response.data;
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
          return null;
        }

        return { id: user.id, email: user.email };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      session.user.id = token.id as string;
      return session;
    },

    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
  },
  pages: {
    signIn: "/signin",
  },
  secret: process.env.AUTH_SECRET,
});
