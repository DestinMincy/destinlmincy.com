import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    // Find a customer
    const customer = await prisma.customer.findFirst();

    if (!customer) {
        console.error("No customer found. Please register a user first.");
        return;
    }

    console.log(`Assigning project to customer: ${customer.email} (${customer.id})`);

    // Create a project
    const project = await prisma.project.create({
        data: {
            title: "AI Portfolio Platform",
            description: "A modern portfolio website with AI integration and client portal.",
            slug: "ai-portfolio-platform",
            technologies: ["Next.js", "TypeScript", "AWS", "Prisma"],
            customerId: customer.id,
            repositoryUrl: "https://git-codecommit.us-east-1.amazonaws.com/v1/repos/destinlmincy-portfolio",
            featured: true,
            milestones: {
                create: [
                    {
                        title: "Phase 1: Foundation",
                        status: "completed",
                        dueDate: new Date("2024-01-15"),
                        deliverables: {},
                    },
                    {
                        title: "Phase 2: Admin Panel",
                        status: "completed",
                        dueDate: new Date("2024-01-30"),
                        deliverables: {},
                    },
                    {
                        title: "Phase 3: Authentication",
                        status: "completed",
                        dueDate: new Date("2024-02-15"),
                        deliverables: {},
                    },
                    {
                        title: "Phase 4: Project Engine",
                        status: "in_progress",
                        dueDate: new Date("2024-02-28"),
                        deliverables: {},
                    },
                    {
                        title: "Phase 5: Quotes & Invoices",
                        status: "pending",
                        dueDate: new Date("2024-03-15"),
                        deliverables: {},
                    },
                ],
            },
        },
    });

    console.log("Created project:", project.id);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
