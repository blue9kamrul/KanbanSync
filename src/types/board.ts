import { Prisma } from '../generated/prisma/client';

export type BoardWithColumnsAndTasks = Prisma.BoardGetPayload<{
    include: {
        columns: {
            include: { tasks: true };
        };
    };
}>;