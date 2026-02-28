import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from './src/lib/db';
import { authConfig } from './auth.config';

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    adapter: PrismaAdapter(prisma),
    session: { strategy: 'jwt' }, // Using JWTs is faster and works well with Edge middleware
    providers: [
        GitHub({
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET,
        }),
        Google({
            clientId: process.env.GOOGLE_ID,
            clientSecret: process.env.GOOGLE_SECRET,
        }),
    ],
    callbacks: {
        // Persist the user's DB id in the JWT token on first sign-in
        async jwt({ token, user }) {
            if (user) token.id = user.id;
            return token;
        },
        // Expose the id on the session object so server components can read it
        async session({ session, token }) {
            if (token.id) session.user.id = token.id as string;
            return session;
        },
    },
});