import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role: "user" | "superadmin";
    isApproved: boolean;
    isActive: boolean;
  }

  interface Session {
    user: {
      id: string;
      role: "user" | "superadmin";
      isApproved: boolean;
      isActive: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "user" | "superadmin";
    isApproved: boolean;
    isActive: boolean;
  }
}
