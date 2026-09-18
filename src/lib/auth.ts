import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import dbConnect from "./dbConnect";
import User from "@/models/User";
import { findUserByEmail } from "./users";
import { rateLimit, resetRateLimit } from "./rateLimit";

/** Pull the client IP out of NextAuth's request object — works for both
    the App Router NextRequest (headers.get) and plain header maps. */
function clientIpFromReq(req: unknown): string {
  try {
    const headers = (req as any)?.headers;
    const get = (name: string): string | null => {
      if (typeof headers?.get === "function") return headers.get(name);
      const v = headers?.[name];
      return Array.isArray(v) ? String(v[0]) : v ? String(v) : null;
    };
    const fwd = get("x-forwarded-for");
    if (fwd) {
      const first = fwd.split(",")[0].trim();
      if (first) return first;
    }
    return get("x-real-ip")?.trim() || "unknown";
  } catch {
    return "unknown";
  }
}

/* PHASE 8: how often an active session re-checks its role in the DB.
   Lets role changes made directly in Atlas reach logged-in users
   within the hour, without a per-request DB hit. */
const ROLE_SYNC_MS = 60 * 60 * 1000; // 1 hour

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req: any) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Invalid credentials");
                }

                /* BRUTE-FORCE THROTTLE (Phase 2):
                   - per IP: 20 attempts / 15 min (slows credential stuffing)
                   - per IP+email: 5 attempts / 15 min (locks one account)
                   - a successful login clears the per-email counter */
                const ip = clientIpFromReq(req);
                const email = credentials.email.toLowerCase().trim();

                const ipLimit = rateLimit(`login-ip:${ip}`, 20, 15 * 60 * 1000);
                if (!ipLimit.ok) {
                    throw new Error("Too many attempts — take a short break and try again.");
                }

                const failKey = `login-fail:${ip}:${email}`;
                const failLimit = rateLimit(failKey, 5, 15 * 60 * 1000);
                if (!failLimit.ok) {
                    throw new Error("Too many attempts on this account — try again in about 15 minutes.");
                }

                await dbConnect();

                /* PHASE 8: case-insensitive lookup — a user who registered
                   as Foo@x.com can now sign in as foo@x.com */
                const user = await findUserByEmail(email);

                if (!user) {
                    throw new Error("No user found with this email");
                }

                if (user.googleId && !user.password) {
                    throw new Error("Please login with Google");
                }

                const isValid = await user.comparePassword(credentials.password);
                if (!isValid) {
                    throw new Error("Incorrect password");
                }

                /* success — this email's failure count starts fresh */
                resetRateLimit(failKey);

                return { id: user._id.toString(), name: user.name, email: user.email, role: user.role };
            }
        })
    ],

    callbacks: {
        async jwt({ token, user, account }) {
            /* credentials sign-in: authorize() returned the Mongo user.
               PHASE 8: guarded to credentials only — previously this block
               ran for Google too and briefly set token.id to Google's
               provider id (corrected moments later, but wrong in the
               token.email-missing edge case). */
            if (user && account?.type === "credentials") {
                token.id = user.id;
                token.role = (user as any).role;
                token.roleSyncedAt = Date.now();
            }

            if (account?.provider === "google") {
                await dbConnect();
                if (token.email) {
                    const existingUser = await findUserByEmail(token.email);

                    if (existingUser) {
                        token.id = existingUser._id.toString();
                        token.role = existingUser.role;
                        token.roleSyncedAt = Date.now();
                        if (!existingUser.googleId) {
                            existingUser.googleId = account.providerAccountId;
                            await existingUser.save();
                        }
                    } else {
                        const newUser = await User.create({
                            name: token.name || "Google User",
                            /* PHASE 8: always stored lowercase */
                            email: token.email.trim().toLowerCase(),
                            googleId: account.providerAccountId,
                            role: 'user'
                        });
                        token.id = newUser._id.toString();
                        /* PHASE 8 (S7 — THE FIX): the missing line. A
                           brand-new Google user's JWT now carries role
                           "user" like everyone else. */
                        token.role = 'user';
                        token.roleSyncedAt = Date.now();
                    }
                }
            }

            /* PHASE 8: hourly role re-sync. DB-side role changes reach
               active sessions within the hour. This also REPAIRS the
               sessions of any Google users who signed up before this
               deploy (their role claim was undefined). */
            if (token.id && typeof token.id === "string") {
                const last = Number(token.roleSyncedAt || 0);
                if (Date.now() - last > ROLE_SYNC_MS) {
                    token.roleSyncedAt = Date.now();
                    try {
                        await dbConnect();
                        const fresh = await User.findById(token.id).select("role").lean();
                        if (fresh) token.role = (fresh as any).role;
                    } catch {
                        /* DB hiccup — keep the cached role, retry in an hour */
                    }
                }
            }

            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id;
                (session.user as any).role = token.role;
            }
            return session;
        }
    },

    pages: {
        signIn: '/login',
        error: '/login',
    },

    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },

    secret: process.env.NEXTAUTH_SECRET,
};