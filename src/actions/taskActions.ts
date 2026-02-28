'use server'; // Run on the server, not the client

import { prisma } from '../lib/db';
import { revalidatePath } from 'next/cache';
import { TaskStatus, TaskCategory } from '../generated/prisma/client';
import { auth } from '../../auth';

export async function moveTask(
    taskId: string,
    newColumnId: string,
    newOrder: number,
    newStatus: TaskStatus,
    boardId: string
) {
    try {
        if (!taskId || !newColumnId || newOrder < 0) {
            return { success: false, error: 'Invalid input' };
        }
        // Update the database
        await prisma.$transaction([
            // Shift other tasks up
            prisma.task.updateMany({
                where: { columnId: newColumnId, order: { gte: newOrder }, id: { not: taskId } },
                data: { order: { increment: 1 } },
            }),
            // Place this task
            prisma.task.update({
                where: { id: taskId },
                data: { columnId: newColumnId, order: newOrder, status: newStatus },
            }),
        ]);

        // Revalidate the cache
        // This tells Next.js: "The data changed, throw away the cached HTML for the board page"
        revalidatePath(`/board/${boardId}`);
        return { success: true };

    } catch (error) {
        console.error("Failed to move task:", error);
        return { success: false, error: 'Failed to update task position' };
    }
}

export async function createTask(
    boardId: string,
    columnId: string,
    title: string,
    status: TaskStatus,
    category: TaskCategory
) {
    const session = await auth();
    if (!session?.user) return { success: false, error: 'Unauthorized' };

    try {
        // Enforce WIP limit server-side
        const column = await prisma.column.findUnique({
            where: { id: columnId },
            include: { _count: { select: { tasks: true } } },
        });
        if (column?.wipLimit !== null && column?.wipLimit !== undefined) {
            if (column._count.tasks >= column.wipLimit) {
                return { success: false, error: `WIP limit of ${column.wipLimit} reached for "${column.title}"` };
            }
        }

        // Get the highest order number in the column to place the new task at the bottom
        const lastTask = await prisma.task.findFirst({
            where: { columnId },
            orderBy: { order: 'desc' },
        });
        const newOrder = lastTask ? lastTask.order + 1 : 0;

        const task = await prisma.task.create({
            data: {
                title,
                status,
                category,
                order: newOrder,
                columnId,
            },
        });

        revalidatePath(`/board/${boardId}`);
        return { success: true, task };
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Failed to create task:", message);
        return { success: false, error: message };
    }
}