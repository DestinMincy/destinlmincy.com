import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { codeCommitService } from "@/lib/codecommit";

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projectId = params.id;
    const searchParams = request.nextUrl.searchParams;
    const path = searchParams.get("path") || "/";
    const type = searchParams.get("type") || "tree"; // tree or blob

    try {
        // 1. Fetch project and verify access
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: { customer: true },
        });

        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        // Check if user is admin or the assigned customer
        const userRole = (session.user as any).role;
        const userId = (session.user as any).id;

        // Note: In a real app, we'd check if userId matches project.customerId
        // For now, assuming admins can see all, and customers can see their own
        if (userRole !== "admin" && project.customerId !== userId) {
            // Strict check: if project has no customer, maybe only admin can see?
            // Or if project.customerId is set, it must match.
            if (project.customerId && project.customerId !== userId) {
                return NextResponse.json({ error: "Forbidden" }, { status: 403 });
            }
        }

        if (!project.repositoryUrl) {
            return NextResponse.json({ error: "No repository linked to this project" }, { status: 400 });
        }

        // Extract repo name from URL (assuming standard HTTPS format)
        // https://git-codecommit.us-east-1.amazonaws.com/v1/repos/REPO_NAME
        const repoName = project.repositoryUrl.split("/").pop();

        if (!repoName) {
            return NextResponse.json({ error: "Invalid repository URL" }, { status: 500 });
        }

        // 2. Fetch data from CodeCommit
        if (type === "blob") {
            const file = await codeCommitService.getFile(repoName, path);
            return NextResponse.json(file);
        } else {
            const folder = await codeCommitService.getFolder(repoName, path);
            return NextResponse.json(folder);
        }

    } catch (error: any) {
        console.error("Repository API Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch repository data" },
            { status: 500 }
        );
    }
}
