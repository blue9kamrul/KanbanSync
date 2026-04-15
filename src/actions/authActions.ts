// src/actions/auth-actions.ts
'use server';

import { AuthError } from 'next-auth';
import { redirect } from 'next/navigation';
import { signIn, signOut } from '../../auth'; // Adjust path to root auth.ts

export async function loginWithGithub() {
    await signIn('github', { redirectTo: '/' });
}

export async function loginWithGoogle() {
    await signIn('google', { redirectTo: '/' });
}

export async function loginWithCredentials(formData: FormData) {
    const email = String(formData.get('email') ?? '').trim().toLowerCase();
    const password = String(formData.get('password') ?? '');

    if (!email || !password) {
        redirect('/login?error=Email%20and%20password%20are%20required');
    }

    try {
        await signIn('credentials', {
            email,
            password,
            redirectTo: '/',
        });
    } catch (error) {
        if (error instanceof AuthError) {
            redirect('/login?error=Invalid%20email%20or%20password');
        }
        throw error;
    }
}

export async function logout() {
    await signOut({ redirectTo: '/login' });
}