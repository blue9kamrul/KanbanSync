import 'dotenv/config'; // Must be first — loads .env before any other import reads process.env
import { TaskStatus } from '../src/generated/prisma/client';
import { prisma } from '../src/lib/db'; // Import the Prisma client instance from your db.ts file

async function main() {
    // Clear existing data
    await prisma.task.deleteMany();
    await prisma.column.deleteMany();
    await prisma.board.deleteMany();
    await prisma.user.deleteMany();

    // This single line replaces all 4 deleteMany calls
    // await prisma.user.deleteMany();

    // Create a User
    const user = await prisma.user.create({
        data: { name: 'Kamrul', email: 'kamrul@gmail.com' },
    });

    // Create a Board with Columns and Tasks
    await prisma.board.create({
        data: {
            title: 'KanbanSync Roadmap',
            userId: user.id,
            columns: {
                create: [
                    {
                        title: 'To Do',
                        order: 0,
                        tasks: {
                            create: [
                                { title: 'Set up Next.js Architecture', status: TaskStatus.TODO, order: 0 },
                                { title: 'Design Database Schema', status: TaskStatus.TODO, order: 1 },
                            ],
                        },
                    },
                    {
                        title: 'In Progress',
                        order: 1,
                        tasks: {
                            create: [
                                { title: 'Build Server Actions', status: TaskStatus.IN_PROGRESS, order: 0 },
                            ],
                        },
                    },
                    {
                        title: 'Done',
                        order: 2,
                    },
                ],
            },
        },
    });
    console.log('Database seeded successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

// run with npx tsx prisma/seed.ts
