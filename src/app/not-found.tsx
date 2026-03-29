import Link from 'next/link';

export default function NotFound() {
    return (
        <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#dbeafe_0%,_#f8fafc_40%,_#e2e8f0_100%)] flex items-center justify-center p-6">
            <section className="w-full max-w-2xl rounded-3xl bg-white border border-slate-200 shadow-xl p-8 sm:p-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-semibold tracking-wide mb-4">
                    404
                    <span className="w-1 h-1 bg-cyan-300 rounded-full" />
                    Not Found
                </div>

                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight mb-3">
                    This board does not exist
                    <br />
                    or you no longer have access.
                </h1>
                <p className="text-slate-600 leading-relaxed mb-8">
                    The link may be outdated, the board might have been removed,
                    or your membership has changed.
                </p>

                <div className="flex flex-wrap gap-3">
                    <Link
                        href="/"
                        className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors"
                    >
                        Go To Boards
                    </Link>
                    <Link
                        href="/login"
                        className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition-colors"
                    >
                        Login Again
                    </Link>
                </div>
            </section>
        </main>
    );
}