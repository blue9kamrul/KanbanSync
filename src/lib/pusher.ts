import PusherServer from 'pusher';
import PusherClient from 'pusher-js';

// The Server instance (Used in Server Actions to broadcast events)
export const pusherServer = new PusherServer({
    appId: process.env.PUSHER_APP_ID!,
    key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
    secret: process.env.PUSHER_SECRET!,
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    useTLS: true,
});

// The Client instance (Used in React Components to listen for events)
// We use a singleton pattern to prevent multiple connections during re-renders
export const getPusherClient = () => {
    if (!process.env.NEXT_PUBLIC_PUSHER_KEY || !process.env.NEXT_PUBLIC_PUSHER_CLUSTER) {
        throw new Error("Missing Pusher Keys");
    }

    return new PusherClient(
        process.env.NEXT_PUBLIC_PUSHER_KEY,
        { cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER }
    );
};