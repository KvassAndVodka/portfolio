
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import bcrypt from "bcryptjs";
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config();

const connectionString = `${process.env.DATABASE_URL}`
const pool = new pg.Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
    const args = process.argv.slice(2);
    const newPassword = args[0];

    if (!newPassword) {
        console.error("Please provide a new password as an argument.");
        console.error("Usage: npx tsx scripts/update-admin-password.ts <new_password>");
        process.exit(1);
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
        console.error("ADMIN_EMAIL environment variable is not set.");
        process.exit(1);
    }

    console.log(`Updating password for admin user: ${adminEmail}...`);

    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const user = await prisma.user.update({
            where: { email: adminEmail },
            data: { password: hashedPassword },
        });

        console.log("✅ Password updated successfully!");
        console.log("---------------------------------------------------");
        console.log("IMPORTANT: Update your .env file with this new hash to keep it in sync for future deployments/seeding:");
        console.log(`ADMIN_PASSWORD_HASH="${hashedPassword.replace(/\$/g, '\\$')}"`);
        console.log("---------------------------------------------------");

    } catch (error) {
        console.error("Error updating password:", error);
    }
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
