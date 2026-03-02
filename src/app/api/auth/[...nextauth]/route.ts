import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Initialize NextAuth with options imported from lib/auth.ts
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };