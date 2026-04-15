import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { compare } from 'bcryptjs';
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
        Credentials({
            name: 'Email & Password',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                const email = String(credentials?.email ?? '').trim().toLowerCase();
                const password = String(credentials?.password ?? '');

                if (!email || !password) return null;

                const user = await prisma.user.findUnique({ where: { email } });
                if (!user?.hashedPassword) return null;

                const isValid = await compare(password, user.hashedPassword);
                if (!isValid) return null;

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    image: user.image,
                };
            },
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