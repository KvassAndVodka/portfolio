import { PrismaClient } from "@prisma/client";
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
dotenv.config() // fallback to .env

const connectionString = `${process.env.DATABASE_URL}`
const pool = new pg.Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
    console.log('Start seeding...')

    // Seed Admin User
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

    if (adminEmail && adminPasswordHash) {
        const existingUser = await prisma.user.findUnique({
            where: { email: adminEmail }
        });

        if (!existingUser) {
            await prisma.user.create({
                data: {
                    email: adminEmail,
                    password: adminPasswordHash,
                    name: "Admin"
                }
            });
            console.log(`Seeded Admin User: ${adminEmail}`);
        } else {
            console.log(`Admin User already exists: ${adminEmail}`);
        }
    } else {
        console.warn("Skipping Admin User seed: ADMIN_EMAIL or ADMIN_PASSWORD_HASH not found in environment.");
    }

    console.log('Seeding finished.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })