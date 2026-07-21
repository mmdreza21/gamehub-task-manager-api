// scripts/import-seed.ts

import { PrismaClient, Role, Status, Priority } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

export async function seed() {
    console.log('📦 Importing seed data from JSON...');

    const dataPath = path.join(
        __dirname,
        '..',
        '..',
        'prisma',
        'seed-data.json',
    );

    const rawData = fs.readFileSync(dataPath, 'utf8');
    const seedData = JSON.parse(rawData);

    try {
        // Delete existing data
        await prisma.task.deleteMany();
        await prisma.user.deleteMany();

        // Store created users by email
        const users: Record<string, { id: string }> = {};

        // Create users
        for (const userData of seedData.users) {
            const hashedPassword = await bcrypt.hash(userData.password, 10);

            const user = await prisma.user.create({
                data: {
                    name: userData.name,
                    email: userData.email,
                    password: hashedPassword,
                    role: userData.role as Role,
                    isEmailVerified: userData.isEmailVerified,
                },
            });

            users[user.email] = {
                id: user.id,
            };
        }

        // Create tasks
        for (const taskData of seedData.tasks) {
            /**
             * Supports both formats:
             *
             * Old:
             * {
             *   "user": "john@test.com"
             * }
             *
             * New:
             * {
             *   "creator": "admin@test.com",
             *   "assignee": "john@test.com"
             * }
             */

            const creator =
                users[taskData.creator] ??
                users[taskData.user];

            const assignee =
                users[taskData.assignee] ??
                users[taskData.user];

            if (!creator || !assignee) {
                console.warn(
                    `Skipping task "${taskData.title}" because creator or assignee was not found.`,
                );
                continue;
            }

            await prisma.task.create({
                data: {
                    title: taskData.title,
                    desc: taskData.desc,
                    status: taskData.status as Status,
                    priority: taskData.priority as Priority,
                    creatorId: creator.id,
                    assigneeId: assignee.id,
                },
            });
        }



        console.log('✅ Seed data imported successfully!');
        console.log(`👥 Users: ${await prisma.user.count()}`);
        console.log(`📋 Tasks: ${await prisma.task.count()}`);
    } catch (error) {
        console.error('❌ Import failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}