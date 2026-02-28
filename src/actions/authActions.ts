// src/actions/auth-actions.ts
'use server';

import { signIn, signOut } from '../../auth'; // Adjust path to root auth.ts

export async function loginWithGithub() {
    await signIn('github', { redirectTo: '/' });
}

export async function loginWithGoogle() {
    await signIn('google', { redirectTo: '/' });
}

export async function logout() {
    await signOut({ redirectTo: '/login' });
}