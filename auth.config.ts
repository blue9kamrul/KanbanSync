import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/login', // will build this custom page later
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnBoard = nextUrl.pathname.startsWith('/board');

            if (isOnBoard) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            } else if (isLoggedIn && nextUrl.pathname === '/login') {
                // Redirect authenticated users away from the login page
                return Response.redirect(new URL('/', nextUrl));
            }
            return true;
        },
    },
    providers: [], // add providers in the next file
} satisfies NextAuthConfig;