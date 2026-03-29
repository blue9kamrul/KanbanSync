'use client';

import Link from 'next/link';

export default function Error({ reset }: { error: Error; reset: () => void }) {
    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white flex items-center justify-center p-6">
            <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-2xl overflow-hidden">
                <div className="p-8 sm:p-10">
                    <p className="text-xs tracking-[0.22em] uppercase text-cyan-300 font-semibold mb-3">KanbanSync</p>
                    <h1 className="text-3xl sm:text-4xl font-black leading-tight mb-3">Something went wrong while loading this page.</h1>
                    <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                        The good news: your data is still safe. This is usually temporary.
                        Try reloading this page or jump back to your dashboard.
                    </p>

                    <div className="mt-8 flex flex-wrap items-center gap-3">
                        <button
                            onClick={reset}
                            className="px-5 py-2.5 rounded-xl bg-cyan-400 text-slate-900 font-semibold hover:bg-cyan-300 transition-colors"
                        >
                            Try Again
                        </button>
                        <Link
                            href="/"
                            className="px-5 py-2.5 rounded-xl border border-white/20 text-white font-semibold hover:bg-white/10 transition-colors"
                        >
                            Back To Boards
                        </Link>
                    </div>
                </div>

                <div className="h-2 bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500" />
            </div>
        </main>
    );
}