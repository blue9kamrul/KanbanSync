'use server';

import { prisma } from '../lib/db';
import { auth } from '../../auth'; // Adjust path to root auth.ts
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function createBoard(formData: FormData) {
    // Verify Authentication
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');

    const title = formData.get('title') as string;
    if (!title) throw new Error('Title is required');

    // Create the Board WITH default columns in a single transaction
    const board = await prisma.board.create({
        data: {
            title,
            userId: session.user.id,
            columns: {
                create: [
                    { title: 'To Do', order: 0 },
                    { title: 'In Progress', order: 1 },
                    { title: 'Done', order: 2 },
                ],
            },
        },
    });

    revalidatePath('/');
    // Send the user straight to their new board
    redirect(`/board/${board.id}`);
}