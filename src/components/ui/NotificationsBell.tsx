'use client';

import { useEffect, useState } from 'react';
import { getPusherClient } from '../../lib/pusher';
import { acceptInvite, declineInvite } from '../../actions/notificationActions';

type NotificationItem = {
    id?: string;
    type: string;
    boardId?: string;
    taskId?: string;
    from?: string;
    excerpt?: string;
    inviteId?: string;
    boardTitle?: string;
    inviterName?: string | null;
    role?: string | null;
};

export default function NotificationsBell({ userId }: { userId: string }) {
    const [items, setItems] = useState<NotificationItem[]>([]);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!userId) return;
        const pusher = getPusherClient();
        const channel = pusher.subscribe(`user-${userId}`);

        const handleNotification = (data: any) => {
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
        <div className="relative">
            <button onClick={() => setOpen(o => !o)} className="relative">
                🔔
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
                                <div className="text-sm text-gray-800">
                                    {it.type === 'mention' ? 'You were mentioned' : it.type === 'board-invite' ? `Invite to ${it.boardTitle ?? 'a board'}` : (it.type ?? 'Notification')}
                                </div>

                                {/* Primary details */}
                                {it.inviterName && <div className="text-xs text-gray-500">From: {it.inviterName}</div>}
                                {it.boardTitle && <div className="text-xs text-gray-500">Board: {it.boardTitle}</div>}
                                {it.role && <div className="text-xs text-gray-500">Role: {it.role}</div>}
                                {it.excerpt && <div className="text-xs text-gray-500 mt-1 truncate">{it.excerpt}</div>}

                                {/* If the notification has unexpected keys, show them so you can inspect contents */}
                                {Object.keys(it).length > 0 && (
                                    <div className="mt-2 text-xs text-gray-400">
                                        {Object.entries(it).filter(([k]) => !['type', 'excerpt', 'inviteId', 'boardTitle', 'inviterName', 'role', 'boardId', 'taskId', 'id'].includes(k)).map(([k, v]) => (
                                            <div key={k}><strong className="text-gray-600">{k}:</strong> {String(v)}</div>
                                        ))}
                                    </div>
                                )}

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
