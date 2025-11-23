import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import ProjectView from "@/components/projects/ProjectView";

export const dynamic = "force-dynamic";

export default async function ProjectDetailsPage({ params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/customer/login");
    }

    const user = session.user as any;

    const project = await prisma.project.findUnique({
        where: {
            id: params.id,
        },
        include: {
            milestones: {
                orderBy: {
                    createdAt: "asc",
                },
            },
        },
    });

    if (!project) {
        notFound();
    }

    // Access control
    if (user.role !== "admin" && project.customerId !== user.id) {
        // If strict mode, redirect. For now, if no customer assigned, maybe allow view?
        // But usually projects are private.
        if (project.customerId && project.customerId !== user.id) {
            redirect("/customer/projects");
        }
    }

    return <ProjectView project={project} milestones={project.milestones} />;
}
