import Link from 'next/link';
import { signupWithCredentials } from '../../actions/authActions';

export default async function SignupPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>;
}) {
    const query = await searchParams;
    const errorMessage = query?.error ? decodeURIComponent(query.error) : null;

    return (
        <div className="min-h-screen app-bg flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full app-surface border border-slate-200/70 p-10 rounded-3xl shadow-xl anim-panel-in">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                        Create your account
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Sign up with your email and password.
                    </p>
                </div>

                {errorMessage ? (
                    <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                        {errorMessage}
                    </div>
                ) : null}

                <form action={signupWithCredentials} className="space-y-3.5">
                    <input
                        type="text"
                        name="name"
                        required
                        placeholder="Your full name"
                        className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                    <input
                        type="email"
                        name="email"
                        required
                        placeholder="you@example.com"
                        className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                    <input
                        type="password"
                        name="password"
                        minLength={8}
                        required
                        placeholder="At least 8 characters"
                        className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                    <button
                        type="submit"
                        className="w-full flex justify-center py-3 px-4 rounded-xl text-sm font-semibold text-white bg-cyan-700 hover:bg-cyan-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-600 transition-colors"
                    >
                        Sign up
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-600">
                    Already have an account?{' '}
                    <Link href="/login" className="font-semibold text-cyan-700 hover:text-cyan-800">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}