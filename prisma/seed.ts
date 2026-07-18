import { PrismaClient, Role, Status } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function seed() {
    console.log("🌱 Seeding database...");

    // Clean up existing data
    await prisma.note.deleteMany();
    await prisma.task.deleteMany();
    await prisma.user.deleteMany();

    const password = await bcrypt.hash("Password123!", 10);

    // ==================== USERS ====================
    const admin = await prisma.user.create({
        data: {
            name: "John Doe",
            email: "admin@example.com",
            password,
            role: Role.AdminOfSite,
            isEmailVerified: true,
        },
    });

    const michael = await prisma.user.create({
        data: {
            name: "Michael Smith",
            email: "michael@example.com",
            password,
            role: Role.User,
            isEmailVerified: true,
        },
    });

    const emily = await prisma.user.create({
        data: {
            name: "Emily Johnson",
            email: "emily@example.com",
            password,
            role: Role.User,
            isEmailVerified: true,
        },
    });

    const date1 = new Date();
    date1.setDate(date1.getDate() - 2);
    const date2 = new Date();
    date2.setDate(date2.getDate() - 5);

    // ==================== TASKS ====================
    await prisma.task.createMany({
        data: [
            // Admin tasks
            {
                title: "Setup PostgreSQL Database",
                desc: "Install PostgreSQL and configure Prisma ORM",
                status: Status.Done,
                priority: 2,
                doneAt: date1,
                userId: admin.id,
            },
            {
                title: "Implement JWT Authentication",
                desc: "Create login and refresh token endpoints",
                status: Status.Doing,
                priority: 2,
                userId: admin.id,
            },
            {
                title: "Create API Documentation",
                desc: "Generate Swagger docs for all endpoints",
                status: Status.Todo,
                priority: 1,
                userId: admin.id,
            },
            {
                title: "Setup Monitoring",
                desc: "Implement health checks with Prometheus",
                status: Status.ToReview,
                priority: 1,
                userId: admin.id,
            },
            {
                title: "Migrate to Microservices",
                desc: "Split monolith into microservices",
                status: Status.Canceled,
                priority: 0,
                userId: admin.id,
            },

            // Michael tasks
            {
                title: "Design Homepage",
                desc: "Create responsive landing page with Tailwind",
                status: Status.Done,
                priority: 1,
                doneAt: date2,
                userId: michael.id,
            },
            {
                title: "Create User Dashboard",
                desc: "Build dashboard with Recharts statistics",
                status: Status.Doing,
                priority: 2,
                userId: michael.id,
            },
            {
                title: "Write Documentation",
                desc: "Prepare README and API usage guides",
                status: Status.Todo,
                priority: 1,
                userId: michael.id,
            },
            {
                title: "Implement PWA Features",
                desc: "Make app installable with service workers",
                status: Status.ToReview,
                priority: 2,
                userId: michael.id,
            },
            {
                title: "Create Mobile App",
                desc: "Build React Native app with Expo",
                status: Status.Canceled,
                priority: 0,
                userId: michael.id,
            },

            // Emily tasks
            {
                title: "Learn Docker Basics",
                desc: "Understand containers, volumes, and networks",
                status: Status.Done,
                priority: 0,
                doneAt: date1,
                userId: emily.id,
            },
            {
                title: "Implement Search",
                desc: "Add full-text search with Elasticsearch",
                status: Status.Doing,
                priority: 2,
                userId: emily.id,
            },
            {
                title: "Add Notifications",
                desc: "Implement push notifications for deadlines",
                status: Status.Todo,
                priority: 2,
                userId: emily.id,
            },
            {
                title: "Optimize Prisma Queries",
                desc: "Reduce query count with eager loading",
                status: Status.ToReview,
                priority: 1,
                userId: emily.id,
            },
            {
                title: "Implement Blockchain",
                desc: "Add blockchain for task verification",
                status: Status.Canceled,
                priority: 1,
                userId: emily.id,
            },
        ],
    });

    // ==================== NOTES ====================
    await prisma.note.createMany({
        data: [
            {
                title: "Backend Architecture",
                content: "Enable CORS before deployment. Use environment variables for secrets. Add request logging with Winston.",
                userId: admin.id,
            },
            {
                title: "Security Checklist",
                content: "Implement rate limiting (100 req/min), input validation, and XSS protection with helmet.",
                userId: admin.id,
            },
            {
                title: "Frontend State",
                content: "Use React Query for caching and Zod for validation. Zustand for global state management.",
                userId: michael.id,
            },
            {
                title: "Deployment Notes",
                content: "Use health checks in Docker Compose. Add wait-for-it script for database readiness.",
                userId: emily.id,
            },
            {
                title: "UI Improvements",
                content: "Add loading skeletons and error boundaries. Implement optimistic updates for better UX.",
                userId: michael.id,
            },
            {
                title: "Database Tips",
                content: "Use indexes on foreign keys and frequently queried fields for better performance.",
                userId: emily.id,
            },
        ],
    });

    console.log("✅ Database seeded successfully!");
    console.log(`👥 Users: ${await prisma.user.count()}`);
    console.log(`📋 Tasks: ${await prisma.task.count()}`);
    console.log(`📝 Notes: ${await prisma.note.count()}`);
}


seed()
    .catch(console.error)
    .finally(async () => {
        prisma.$disconnect()
    });