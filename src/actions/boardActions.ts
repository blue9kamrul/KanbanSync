'use server';

import { prisma } from '../lib/db';
import { auth } from '../../auth'; // Adjust path to root auth.ts
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { BoardRole } from '../generated/prisma/client';

export async function createBoard(formData: FormData) {
    // Verify Authentication
    const session = await auth();
    if (!session?.user?.email) throw new Error('Unauthorized');

    const title = formData.get('title') as string;
    if (!title) throw new Error('Title is required');

    // Look up the user by email so we always use the current DB id,
    // even if the JWT was issued before a DB reset (stale session.user.id).
    const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!dbUser) throw new Error('User record not found – please sign out and sign back in.');

    // Create the Board WITH default columns
    // NOTE: some Prisma client versions or generated clients may not expose
    // nested relation writes for `members`. Create the board first, then
    // create the BoardMember as a separate step to avoid Prisma validation errors.
    const board = await prisma.board.create({
        data: {
            title,
            userId: dbUser.id,
            // Create the new Agile columns
            columns: {
                create: [
                    { title: 'Backlog', order: 0 },
                    { title: 'To Do', order: 1 },
                    { title: 'In Progress', order: 2, wipLimit: 3 },
                    { title: 'Review', order: 3 },
                    { title: 'Done', order: 4 },
                ],
            },
        },
    });

    // Ensure creator is a member/leader of the board.
    await prisma.boardMember.create({
        data: {
            boardId: board.id,
            userId: dbUser.id,
            role: BoardRole.LEADER,
        },
    });

    revalidatePath('/');
    // Send the user straight to their new board
    redirect(`/board/${board.id}`);
}