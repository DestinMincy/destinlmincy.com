import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import CognitoProvider from "next-auth/providers/cognito";

import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
    // ... (providers remain the same)
    providers: [
        // Admin authentication with credentials
        CredentialsProvider({
            id: "admin-credentials",
            name: "Admin Login",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                // TODO: Replace with database check in next step
                if (
                    credentials?.username === "admin" &&
                    credentials?.password === "admin"
                ) {
                    return {
                        id: "1",
                        name: "Destin Mincy",
                        email: "admin@destinlmincy.com",
                        role: "admin"
                    };
                }
                return null;
            },
        }),
        // Customer authentication with AWS Cognito
        CognitoProvider({
            clientId: process.env.COGNITO_CLIENT_ID!,
            clientSecret: "", // Required by TS, but ignored due to auth method "none"
            issuer: process.env.COGNITO_ISSUER,
            client: {
                token_endpoint_auth_method: "none",
            },
        }),
    ],
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async signIn({ user, account, profile }: any) {
            // Only sync for Cognito users
            if (account?.provider === "cognito") {
                try {
                    const email = user.email;
                    const name = user.name || profile?.name || email?.split("@")[0];
                    const cognitoId = user.id; // This is the 'sub' from Cognito

                    if (email) {
                        // Check if user exists
                        const existingUser = await prisma.client.findUnique({
                            where: { email },
                        });

                        if (!existingUser) {
                            // Create new user
                            await prisma.client.create({
                                data: {
                                    email,
                                    name,
                                    cognitoId,
                                    role: "client",
                                },
                            });
                        } else if (!existingUser.cognitoId) {
                            // Link existing user to Cognito
                            await prisma.client.update({
                                where: { email },
                                data: { cognitoId },
                            });
                        }
                    }
                } catch (error) {
                    console.error("Error syncing user to database:", error);
                    // We don't block sign in, but log the error
                }
            }
            return true;
        },
        async session({ session, token }: any) {
            if (session?.user) {
                // Default from token
                session.user.role = token.role || "client";
                session.user.id = token.sub;

                // Try to fetch latest role/id from DB if available
                if (session.user.email) {
                    try {
                        const dbUser = await prisma.client.findUnique({
                            where: { email: session.user.email },
                        });
                        if (dbUser) {
                            session.user.role = dbUser.role;
                            session.user.id = dbUser.id; // Use DB ID instead of Cognito sub
                        }
                    } catch (e) {
                        // Ignore DB errors in session callback to prevent logout
                    }
                }
            }
            return session;
        },
        async jwt({ token, user, account }: any) {
            if (user) {
                token.role = (user as any).role || "client";
            }
            // For Cognito users, mark them as clients
            if (account?.provider === "cognito") {
                token.role = "client";
            }
            return token;
        },
    },
    secret: process.env.NEXTAUTH_SECRET || "secret",
};
