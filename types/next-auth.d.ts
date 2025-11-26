import { DefaultSession } from "next-auth";

export type AppRole = "admin" | "user";

declare module "next-auth" {
  interface Session {
    user?: DefaultSession["user"] & {
      role: AppRole;
    };
  }

  interface User {
    role: AppRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: AppRole;
  }
}


