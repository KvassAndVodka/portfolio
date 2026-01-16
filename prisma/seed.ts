import { PrismaClient, PostType } from "@prisma/client";
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import fs from "fs"
import path from "path"
import matter from "gray-matter"
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

    const postsDir = path.join(process.cwd(), 'content/posts')
    if (fs.existsSync(postsDir)) {
        const files = fs.readdirSync(postsDir)
        for (const file of files) {
            if (!file.endsWith('.mdx')) continue

            const filePath = path.join(postsDir, file)
            const content = fs.readFileSync(filePath, 'utf-8')
            const { data, content: mdxContent } = matter(content)
            const slug = file.replace('.mdx', '')

            await prisma.post.upsert({
                where: { slug },
                update: {
                    title: data.title,
                    summary: data.summary,
                    content: mdxContent,
                    publishedAt: new Date(data.publishedAt || new Date()),
                    type: PostType.BLOG,
                },
                create: {
                    slug,
                    title: data.title,
                    summary: data.summary, // Fixed typo: summmar
                    content: mdxContent,
                    publishedAt: new Date(data.publishedAt || new Date()), // Fixed typo: publichedAt
                    type: PostType.BLOG,
                },
            })
            console.log(`Seeded Blog: ${slug}`)
        }
    }

    const projectsDir = path.join(process.cwd(), 'content/projects')
    if (fs.existsSync(projectsDir)) {
        const files = fs.readdirSync(projectsDir)
        for (const file of files) {
            if (!file.endsWith('.mdx')) continue

            const filePath = path.join(projectsDir, file)
            const content = fs.readFileSync(filePath, 'utf-8')
            const { data, content: mdxContent} = matter(content)
            const slug = file.replace('.mdx', '')

            await prisma.post.upsert({
                where: { slug },
                update: {
                    title: data.title,
                    summary: data.summary,
                    content: mdxContent,
                    type: PostType.PROJECT,
                    techStack: data.techStack || [],
                    githubUrl: data.githubUrl,
                    demoUrl: data.demoUrl,
                    projectUrl: data.projectUrl,
                    category: data.category,
                    isPinned: data.isPinned || false,
                    showAsBlog: data.showAsBlog || false,
                },
                create: {
                    slug,
                    title: data.title,
                    summary: data.summary,
                    content: mdxContent,
                    publishedAt: new Date(data.publishedAt || new Date()),
                    type: PostType.PROJECT,
                    techStack: data.techStack || [],
                    githubUrl: data.githubUrl,
                    demoUrl: data.demoUrl,
                    projectUrl: data.projectUrl,
                    category: data.category,
                    isPinned: data.isPinned || false,
                    showAsBlog: data.showAsBlog || false,
                },
            })
            console.log(`Seeded Project: ${slug}`)
        }
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