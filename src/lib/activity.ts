import { prisma } from './db';
import { TaskActivityType } from '../generated/prisma/client';
import type { Prisma } from '../generated/prisma/client';

type ActivityInput = {
    taskId: string;
    action: TaskActivityType;
    message: string;
    actorId?: string | null;
    meta?: Prisma.InputJsonValue;
};

export async function logTaskActivity(input: ActivityInput) {
    try {
        await prisma.taskActivity.create({
            data: {
                taskId: input.taskId,
                action: input.action,
                message: input.message,
                actorId: input.actorId ?? null,
                ...(input.meta !== undefined ? { meta: input.meta } : {}),
            },
        });
    } catch (error) {
        // Activity logging should never block the main user flow.
        console.warn('Task activity logging skipped:', error);
    }
}
