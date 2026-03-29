'use client';

import { useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    className?: string;
}

// useSyncExternalStore returns the server snapshot (false) on SSR
// and the client snapshot (true) after hydration — no useEffect needed.
const subscribe = () => () => { };

export default function Modal({ isOpen, onClose, children, className }: ModalProps) {
    const mounted = useSyncExternalStore(subscribe, () => true, () => false);

    if (!isOpen || !mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-md p-4">
            <div className={`app-bg rounded-2xl shadow-2xl ring-1 ring-slate-200/80 w-full relative overflow-hidden ${className ?? 'max-w-md'}`}>
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center rounded-full text-slate-500 hover:text-slate-800 bg-white/80 hover:bg-white border border-slate-200/80 shadow-sm transition-colors text-sm"
                    aria-label="Close modal"
                >
                    ✕
                </button>
                {children}
            </div>
        </div>,
        document.body
    );
}