import { prisma } from '../lib/db';
import { redirect } from 'next/navigation';

export default async function Home() {
  // Find the first available board (from our seed)
  // for dev purpose right now we assume there is only one user and one board. In a real app, we would show a dashboard with all boards or redirect to a "create your first board" page.
  const firstBoard = await prisma.board.findFirst();

  if (firstBoard) {
    // Automatically route the user to the dynamic board page
    redirect(`/board/${firstBoard.id}`);
  }

  return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold text-red-500">No boards found in the database.</h1>
      <p>Please run `npx tsx prisma/seed.ts` to populate the data.</p>
    </div>
  );
}