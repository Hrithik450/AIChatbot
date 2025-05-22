import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        if (
          credentials.email === process.env.EMAIL &&
          credentials.password === process.env.PASSWORD
        ) {
          return { email: process.env.EMAIL };
        } else {
          throw new Error("Invalid Credentials");
        }
      },
    }),
  ],
});
