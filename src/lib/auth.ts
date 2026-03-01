import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

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
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Invalid credentials");
                }

                await dbConnect();
                const user = await User.findOne({ email: credentials.email });

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

                return { id: user._id.toString(), name: user.name, email: user.email, role: user.role };
            }
        })
    ],

    callbacks: {
        async jwt({ token, user, account }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
            }

            if (account?.provider === "google") {
                await dbConnect();
                if (token.email) {
                    const email = token.email;
                    const existingUser = await User.findOne({ email: email });

                    if (existingUser) {
                        token.id = existingUser._id.toString();
                        token.role = existingUser.role;
                        if (!existingUser.googleId) {
                            existingUser.googleId = account.providerAccountId;
                            await existingUser.save();
                        }
                    } else {
                        const newName = token.name || "Google User";
                        const newUser = await User.create({
                            name: newName,
                            email: email,
                            googleId: account.providerAccountId,
                            role: 'user'
                        });
                        token.id = newUser._id.toString();
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
        maxAge: 30 * 24 * 60 * 60,
    },

    secret: process.env.NEXTAUTH_SECRET,
};