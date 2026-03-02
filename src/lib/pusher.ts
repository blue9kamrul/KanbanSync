import PusherClient from 'pusher-js';

// Browser-only client — safe to import in Client Components.
// PusherServer lives in pusher-server.ts (server-only) to prevent
// the Node.js `pusher` package from being bundled into the client.
export const getPusherClient = () => {
    if (!process.env.NEXT_PUBLIC_PUSHER_KEY || !process.env.NEXT_PUBLIC_PUSHER_CLUSTER) {
        throw new Error('Missing Pusher public keys. Set NEXT_PUBLIC_PUSHER_KEY and NEXT_PUBLIC_PUSHER_CLUSTER.');
    }

    return new PusherClient(
        process.env.NEXT_PUBLIC_PUSHER_KEY,
        { cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER }
    );
};