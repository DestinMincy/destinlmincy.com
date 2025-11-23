import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, Tag, Empty, Button } from "antd";
import { FolderOpenOutlined, ArrowRightOutlined } from "@ant-design/icons";

// Force dynamic rendering since we depend on user session
export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/client/login");
    }

    const user = session.user as any;

    // Fetch projects for this client
    const projects = await prisma.project.findMany({
        where: {
            clientId: user.id,
        },
        orderBy: {
            updatedAt: "desc",
        },
    });

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
                    <p className="text-gray-600 mt-1">Track progress and view code</p>
                </div>
            </div>

            {projects.length === 0 ? (
                <Card className="text-center py-12">
                    <Empty
                        description={
                            <span className="text-gray-500">
                                No projects assigned yet.
                            </span>
                        }
                    />
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <Link href={`/client/projects/${project.id}`} key={project.id}>
                            <Card
                                hoverable
                                className="h-full border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                                title={
                                    <div className="flex items-center gap-2">
                                        <FolderOpenOutlined className="text-blue-600" />
                                        <span>{project.title}</span>
                                    </div>
                                }
                                extra={<ArrowRightOutlined className="text-gray-400" />}
                            >
                                <p className="text-gray-600 line-clamp-2 mb-4 h-10">
                                    {project.description}
                                </p>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    {project.technologies.slice(0, 3).map((tech) => (
                                        <Tag key={tech} color="blue">{tech}</Tag>
                                    ))}
                                    {project.technologies.length > 3 && (
                                        <Tag>+{project.technologies.length - 3}</Tag>
                                    )}
                                </div>

                                <div className="flex justify-between items-center text-xs text-gray-500 border-t pt-4 mt-auto">
                                    <span>Updated: {new Date(project.updatedAt).toLocaleDateString()}</span>
                                    {project.featured && <Tag color="gold">Featured</Tag>}
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
