import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
        const isLoggedIn = !!auth?.user;
        const isOnAdmin = nextUrl.pathname.startsWith('/admin');
        if (isOnAdmin) {
            if (isLoggedIn) return true;
            return false;
        }
        return true;
    },
  },
  providers: [], // Providers added in auth.ts
} satisfies NextAuthConfig
