// src/app/board/[boardId]/page.tsx
import { getBoardData } from '../../../lib/dataAccessLayer';
import KanbanBoard from '../../../components/features/board/KanbanBoard';
import { notFound } from 'next/navigation';
import { getUserRole } from '../../../lib/permission';

// Never pre-render at build time — this page queries the database at runtime
export const dynamic = 'force-dynamic';


export default async function BoardPage({ params }: { params: Promise<{ boardId: string }> }) {
    // 1. Fetch data on the server
    const { boardId } = await params;
    // Fetch data AND the current user's role simultaneously 
    const [board, userRole] = await Promise.all([
        getBoardData(boardId),
        getUserRole(boardId)
    ]);

    // Fallback in case the DAL didn't throw but returned null
    if (!board) notFound();

    return (
        <main className="min-h-screen bg-gray-50 p-8 flex flex-col">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">{board.title}</h1>
            </header>

            <div className="flex-1 overflow-hidden">
                {/* Pass the role into the board! */}
                <KanbanBoard initialBoard={board} userRole={userRole} />
            </div>
        </main>
    );
}