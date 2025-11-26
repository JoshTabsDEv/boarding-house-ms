import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { AppRole } from "@/types/next-auth";

const adminUsername = process.env.ADMIN_USERNAME ?? "admin";
const adminPassword = process.env.ADMIN_PASSWORD ?? "admin";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    CredentialsProvider({
      name: "Admin Login",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (
          credentials?.username === adminUsername &&
          credentials?.password === adminPassword
        ) {
          return {
            id: "admin",
            name: "Administrator",
            email: "admin@boarding-house.local",
            role: "admin" as AppRole,
          };
        }
        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user && "role" in user) {
        token.role = (user.role as AppRole) ?? "user";
      } else if (account?.provider === "google") {
        token.role = "user";
      }
      token.role = (token.role as AppRole) ?? "user";
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = (token.role as AppRole) ?? "user";
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
};


