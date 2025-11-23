"use client";

import { AuthProvider } from "@refinedev/core";
import { getSession, signIn, signOut } from "next-auth/react";

export const authProvider: AuthProvider = {
    login: async ({ providerName, email, password }) => {
        const signInResponse = await signIn(providerName || "credentials", {
            email,
            password,
            callbackUrl: "/admin",
            redirect: false,
        });

        if (signInResponse && !signInResponse.error) {
            return {
                success: true,
                redirectTo: "/admin",
            };
        }

        return {
            success: false,
            error: {
                name: "LoginError",
                message: signInResponse?.error || "Invalid username or password",
            },
        };
    },
    logout: async () => {
        await signOut({
            redirect: true,
            callbackUrl: "/login",
        });
        return {
            success: true,
            redirectTo: "/login",
        };
    },
    check: async () => {
        const session = await getSession();
        console.log("AuthProvider Check:", session);
        if (session) {
            return {
                authenticated: true,
            };
        }

        return {
            authenticated: false,
            redirectTo: "/login",
        };
    },
    getPermissions: async () => {
        const session = await getSession();
        return session?.user ? (session.user as any).role : null;
    },
    getIdentity: async () => {
        const session = await getSession();
        return session?.user;
    },
    onError: async (error) => {
        console.error(error);
        return { error };
    },
};
