import 'dotenv/config';
import { hash } from 'bcryptjs';
import { prisma } from '../src/lib/db';
import { DEMO_ACCOUNT } from '../src/lib/demoAccount';

async function main() {
    const hashedPassword = await hash(DEMO_ACCOUNT.password, 12);

    const user = await prisma.user.upsert({
        where: { email: DEMO_ACCOUNT.email },
        update: {
            name: DEMO_ACCOUNT.name,
            hashedPassword,
        },
        create: {
            name: DEMO_ACCOUNT.name,
            email: DEMO_ACCOUNT.email,
            hashedPassword,
        },
    });

    console.log(`Demo user ready: ${user.email}`);
}

main()
    .catch((error) => {
        console.error('Failed to seed demo user:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });