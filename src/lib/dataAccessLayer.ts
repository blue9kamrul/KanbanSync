import { prisma } from './db';
import { cache } from 'react';
import { notFound } from 'next/navigation';
import { BoardWithColumnsAndTasks } from '../types/board';

// 'cache' memoizes the result for the duration of the server request
export const getBoardData = cache(async (boardId: string): Promise<BoardWithColumnsAndTasks> => {
    if (!boardId) notFound(); // guard before any DB call

    const board = await prisma.board.findUnique({
        where: { id: boardId },
        include: {
            columns: {
                orderBy: { order: 'asc' }, // Keep columns in the right order
                include: {
                    tasks: {
                        orderBy: { order: 'asc' }, // Keep tasks in the right order
                    },
                },
            },
        },
    });

    if (!board) notFound(); //triggers not-found.tsx (404 page)

    return board;
});


// TODO:
// 5. DAL is incomplete — only one function exists
// A real DAL should cover all data fetching needs:
// export const getUserBoards = cache(async (userId: string) => {...});
// export const getColumnById = cache(async (columnId: string) => {...});
// export const getTaskById   = cache(async (taskId: string) => {...});

// Right now if another component needs user boards, it'll bypass the DAL and write raw Prisma queries inline.