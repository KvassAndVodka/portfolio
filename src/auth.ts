import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        GitHub({
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET
        })
    ],
    callbacks: {
        async signIn({ user, profile}) {
            if (!process.env.ADMIN_EMAIL) {
                console.error("ADMIN_EMAIL is not set");
                return false;
            }

            const isAllowed = user.email === process.env.ADMIN_EMAIL;

            if (!isAllowed) {
                console.warn(`Access denied for: ${user.email}`);
            }

            return isAllowed;
        }
    }
})