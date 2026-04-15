// src/actions/auth-actions.ts
'use server';

import { AuthError } from 'next-auth';
import { redirect } from 'next/navigation';
import { hash } from 'bcryptjs';
import { signIn, signOut } from '../../auth'; // Adjust path to root auth.ts
import { prisma } from '../lib/db';
import { DEMO_ACCOUNT } from '../lib/demoAccount';

export async function loginWithGithub() {
    await signIn('github', { redirectTo: '/' });
}

export async function loginWithGoogle() {
    await signIn('google', { redirectTo: '/' });
}

async function ensureDemoUserExistsIfRequested(email: string) {
    if (email !== DEMO_ACCOUNT.email.toLowerCase()) return;

    const hashedPassword = await hash(DEMO_ACCOUNT.password, 12);
    await prisma.user.upsert({
        where: { email: DEMO_ACCOUNT.email },
        update: {
            name: DEMO_ACCOUNT.name,
            hashedPassword,
        },
        create: {
            name: DEMO_ACCOUNT.name,
            email: DEMO_ACCOUNT.email,
            hashedPassword,
        },
    });
}

export async function loginWithCredentials(formData: FormData) {
    const email = String(formData.get('email') ?? '').trim().toLowerCase();
    const password = String(formData.get('password') ?? '');

    if (!email || !password) {
        redirect('/login?error=Email%20and%20password%20are%20required');
    }

    try {
        await ensureDemoUserExistsIfRequested(email);

        const result = await signIn('credentials', {
            email,
            password,
            redirect: false,
        });

        if (result?.error) {
            redirect('/login?error=Invalid%20email%20or%20password');
        }

        redirect('/');
    } catch (error) {
        if (error instanceof AuthError) {
            redirect('/login?error=Invalid%20email%20or%20password');
        }
        throw error;
    }
}

export async function signupWithCredentials(formData: FormData) {
    const name = String(formData.get('name') ?? '').trim();
    const email = String(formData.get('email') ?? '').trim().toLowerCase();
    const password = String(formData.get('password') ?? '');

    if (!name || !email || !password) {
        redirect('/signup?error=All%20fields%20are%20required');
    }

    if (password.length < 8) {
        redirect('/signup?error=Password%20must%20be%20at%20least%208%20characters');
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    const hashedPassword = await hash(password, 12);

    if (existingUser?.hashedPassword) {
        redirect('/signup?error=Email%20already%20has%20an%20account');
    }

    if (existingUser && !existingUser.hashedPassword) {
        await prisma.user.update({
            where: { id: existingUser.id },
            data: {
                name,
                hashedPassword,
            },
        });
    } else if (!existingUser) {
        await prisma.user.create({
            data: {
                name,
                email,
                hashedPassword,
            },
        });
    }

    try {
        const result = await signIn('credentials', {
            email,
            password,
            redirect: false,
        });

        if (result?.error) {
            redirect('/login?error=Account%20created,%20please%20sign%20in');
        }

        redirect('/');
    } catch (error) {
        if (error instanceof AuthError) {
            redirect('/login?error=Account%20created,%20please%20sign%20in');
        }
        throw error;
    }
}

export async function logout() {
    await signOut({ redirectTo: '/login' });
}