// middleware.ts
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

export default NextAuth(authConfig).auth;

export const config = {
    // This Regex tells Middleware to run on EVERY route EXCEPT:
    // - api routes (/api/*)
    // - Next.js internal static files (_next/static, _next/image)
    // - images/favicon (.*\\.png$)
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};