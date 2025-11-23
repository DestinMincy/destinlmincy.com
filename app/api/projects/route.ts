import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const featured = url.searchParams.get("featured");
        const limit = url.searchParams.get("limit");

        const where = featured === "true" ? { featured: true } : {};
        const take = limit ? parseInt(limit, 10) : undefined;

        const projects = await prisma.project.findMany({
            where,
            take,
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ data: projects });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const project = await prisma.project.create({
            data: {
                title: body.title,
                description: body.description,
                slug: body.slug,
                technologies: body.technologies || [],
                images: body.images || [],
                liveUrl: body.liveUrl,
                githubUrl: body.githubUrl,
                repositoryUrl: body.repositoryUrl,
                licenseType: body.licenseType || "PROPRIETARY",
                featured: body.featured || false,
            },
        });
        return NextResponse.json(project);
    } catch (error) {
        return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
    }
}
