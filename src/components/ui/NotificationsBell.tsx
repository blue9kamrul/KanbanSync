'use client';

import { useEffect, useRef, useState } from 'react';
import { getPusherClient } from '../../lib/pusher';
import { acceptInvite, declineInvite } from '../../actions/notificationActions';

type NotificationItem = {
    id?: string;
    type: string;
    boardId?: string;
    taskId?: string;
    from?: string;
    fromName?: string | null;
    excerpt?: string;
    inviteId?: string;
    boardTitle?: string;
    inviterName?: string | null;
    role?: string | null;
};

export default function NotificationsBell({ userId }: { userId: string }) {
    const [items, setItems] = useState<NotificationItem[]>([]);
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking anywhere outside the component
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    useEffect(() => {
        if (!userId) return;
        const pusher = getPusherClient();
        const channel = pusher.subscribe(`user-${userId}`);

        const handleNotification = (data: NotificationItem) => {
            setItems((s) => [data, ...s].slice(0, 20));
        };

        channel.bind('notification', handleNotification);
        channel.bind('invite-received', handleNotification);
        channel.bind('invite-accepted', handleNotification);

        return () => {
            channel.unbind('notification', handleNotification);
            channel.unbind('invite-received', handleNotification);
            channel.unbind('invite-accepted', handleNotification);
            pusher.unsubscribe(`user-${userId}`);
        };
    }, [userId]);

    const handleAccept = async (inviteId?: string, boardId?: string) => {
        if (!inviteId) return;
        // call server action
        const res = await acceptInvite(inviteId);
        if (res?.success) {
            setItems((s) => s.filter(i => i.inviteId !== inviteId));
        }
    };

    const handleDecline = async (inviteId?: string) => {
        if (!inviteId) return;
        const res = await declineInvite(inviteId);
        if (res?.success) {
            setItems((s) => s.filter(i => i.inviteId !== inviteId));
        }
    };

    return (
        <div className="relative" ref={containerRef}>
            <button onClick={() => setOpen(o => !o)} className="relative inline-flex items-center" aria-label="Notifications">
                <svg className="w-6 h-6 text-gray-700" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <path d="M15 17H9a3 3 0 006 0z" fill="currentColor" opacity="0.9" />
                    <path d="M12 2a6 6 0 00-6 6v3.586L4.293 14.293A1 1 0 005 16h14a1 1 0 00.707-1.707L18 11.586V8a6 6 0 00-6-6z" fill="currentColor" />
                </svg>
                {items.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] rounded-full px-1.5">{items.length}</span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50">
                    <div className="p-3 border-b border-gray-100 font-semibold">Notifications</div>
                    <div className="max-h-64 overflow-y-auto">
                        {items.length === 0 && <div className="p-3 text-sm text-gray-500">No notifications</div>}
                        {items.map((it, idx) => (
                            <div key={it.id ?? idx} className="p-3 border-b last:border-b-0">
                                {/* Title */}
                                <div className="text-sm font-medium text-gray-800">
                                    {it.type === 'mention'
                                        ? `${it.fromName ?? 'Someone'} mentioned you${it.boardTitle ? ` in ${it.boardTitle}` : ''}`
                                        : it.type === 'board-invite'
                                            ? `Invite to ${it.boardTitle ?? 'a board'}`
                                            : it.type === 'added-to-board'
                                                ? `Added to ${it.boardTitle ?? 'a board'}`
                                                : (it.type ?? 'Notification')}
                                </div>

                                {/* Primary details */}
                                {(it.inviterName && it.type !== 'mention') && <div className="text-xs text-gray-500">From: {it.inviterName}</div>}
                                {(it.boardTitle && it.type === 'board-invite') && <div className="text-xs text-gray-500">Board: {it.boardTitle}</div>}
                                {it.role && <div className="text-xs text-gray-500">Role: {it.role}</div>}
                                {it.excerpt && <div className="text-xs text-gray-400 mt-1 line-clamp-2">{it.excerpt}</div>}


                                <div className="mt-2 flex gap-2">
                                    {it.type === 'board-invite' && it.inviteId && (
                                        <>
                                            <button onClick={() => handleAccept(it.inviteId, it.boardId)} className="px-3 py-1 bg-blue-600 text-white rounded">Accept</button>
                                            <button onClick={() => handleDecline(it.inviteId)} className="px-3 py-1 bg-gray-100 rounded border">Decline</button>
                                        </>
                                    )}

                                    <button onClick={() => setItems(s => s.filter((_, i) => i !== idx))} className="px-3 py-1 border rounded">Dismiss</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
