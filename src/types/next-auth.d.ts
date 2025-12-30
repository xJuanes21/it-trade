import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role: "user" | "superadmin";
  }

  interface Session {
    user: {
      id: string;
      role: "user" | "superadmin";
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "user" | "superadmin";
  }
}
