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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className={`bg-white rounded-2xl shadow-2xl w-full relative overflow-hidden ${className ?? 'max-w-md'}`}>
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors text-sm"
                >
                    ✕
                </button>
                {children}
            </div>
        </div>,
        document.body
    );
}