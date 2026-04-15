'use client';

import Link from 'next/link';
import { useState } from 'react';

type CredentialsLoginFormProps = {
    action: (formData: FormData) => Promise<void>;
    demoEmail: string;
    demoPassword: string;
};

export default function CredentialsLoginForm({
    action,
    demoEmail,
    demoPassword,
}: CredentialsLoginFormProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    return (
        <>
            <form action={action} className="space-y-3.5 mb-3">
                <input
                    type="email"
                    name="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <input
                    type="password"
                    name="password"
                    required
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <button
                    type="submit"
                    className="w-full flex justify-center py-3 px-4 rounded-xl text-sm font-semibold text-white bg-cyan-700 hover:bg-cyan-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-600 transition-colors"
                >
                    Sign in with Email
                </button>
            </form>

            <button
                type="button"
                onClick={() => {
                    setEmail(demoEmail);
                    setPassword(demoPassword);
                }}
                className="w-full mb-5 flex justify-center py-2.5 px-4 rounded-xl text-sm font-semibold text-cyan-800 bg-cyan-100 border border-cyan-300 hover:bg-cyan-200 transition-colors"
            >
                Use demo credentials
            </button>

            <p className="mb-6 text-center text-sm text-slate-600">
                New here?{' '}
                <Link href="/signup" className="font-semibold text-cyan-700 hover:text-cyan-800">
                    Create an account
                </Link>
            </p>
        </>
    );
}