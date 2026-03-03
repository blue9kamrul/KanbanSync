// src/actions/detail-actions.ts
'use server';

import { prisma } from '../lib/db';
import { auth } from '../../auth';
import { revalidatePath } from 'next/cache';
import { pusherServer } from '../lib/pusher-server';

export async function addComment(taskId: string, boardId: string, text: string) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    try {
        const comment = await prisma.comment.create({
            data: {
                text,
                taskId,
                userId: session.user.id,
            },
            include: { user: true } // Return user info so UI updates instantly
        });

        await pusherServer.trigger(`board-${boardId}`, 'board-updated', { message: 'New comment' });
        revalidatePath(`/board/${boardId}`);
        return { success: true, comment };
    } catch (error) {
        return { success: false, error: 'Failed to add comment' };
    }
}

export async function updateTaskDescription(taskId: string, boardId: string, description: string) {
    try {
        await prisma.task.update({
            where: { id: taskId },
            data: { description },
        });
        revalidatePath(`/board/${boardId}`);
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to update description' };
    }
}

export async function assignTask(taskId: string, boardId: string, assigneeId: string) {
    try {
        await prisma.task.update({
            where: { id: taskId },
            data: { assigneeId },
        });
        await pusherServer.trigger(`board-${boardId}`, 'board-updated', { message: 'Task assigned' });
        revalidatePath(`/board/${boardId}`);
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to assign task' };
    }
}