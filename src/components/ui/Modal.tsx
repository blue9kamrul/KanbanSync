'use client';

import { useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

// useSyncExternalStore returns the server snapshot (false) on SSR
// and the client snapshot (true) after hydration — no useEffect needed.
const subscribe = () => () => { };

export default function Modal({ isOpen, onClose, children }: ModalProps) {
    const mounted = useSyncExternalStore(subscribe, () => true, () => false);

    if (!isOpen || !mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
                >
                    ✕
                </button>
                {children}
            </div>
        </div>,
        document.body // Teleporting to the root!
    );
}