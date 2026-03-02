import { prisma } from './db';
import { auth } from '../../auth';
import { BoardRole } from '../generated/prisma/client';

export async function getUserRole(boardId: string): Promise<BoardRole | null> {
    const session = await auth();
    if (!session?.user?.id) return null;

    const member = await prisma.boardMember.findUnique({
        where: {
            boardId_userId: {
                boardId,
                userId: session.user.id
            }
        }
    });

    return member?.role || null;
}