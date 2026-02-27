// src/app/board/[boardId]/page.tsx
import { getBoardData } from '../../../lib/dataAccessLayer';
import KanbanBoard from '../../../components/features/board/KanbanBoard';
import { notFound } from 'next/navigation';

interface BoardPageProps {
    params: Promise<{ boardId: string }>;
}

export default async function BoardPage({ params }: BoardPageProps) {
    // 1. Fetch data on the server
    const board = await getBoardData((await params).boardId);

    // Fallback in case the DAL didn't throw but returned null
    if (!board) notFound();

    return (
        <main className="min-h-screen bg-gray-50 p-8 flex flex-col">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">{board.title}</h1>
            </header>

            {/* 2. Pass the data to the Client Component for interactivity */}
            <KanbanBoard initialBoard={board} />
        </main>
    );
}