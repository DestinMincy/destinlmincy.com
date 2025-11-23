import { notFound } from "next/navigation";
import { Button, Tag, Divider } from "antd";
import { ArrowLeftOutlined, GithubOutlined, GlobalOutlined } from "@ant-design/icons";
import Link from "next/link";

async function getProjectBySlug(slug: string) {
    try {
        const res = await fetch(`http://localhost:3000/api/projects/slug/${slug}`, {
            cache: "no-store",
        });
        if (!res.ok) return null;
        return await res.json();
    } catch (error) {
        console.error("Failed to fetch project:", error);
        return null;
    }
}

export default async function ProjectDetail({ params }: { params: { slug: string } }) {
    const project = await getProjectBySlug(params.slug);

    if (!project) {
        notFound();
    }

    const technologies = project.technologies ? project.technologies.split(",") : [];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Link href="/projects">
                        <Button
                            type="text"
                            icon={<ArrowLeftOutlined />}
                            className="text-white hover:text-gray-200 mb-4"
                        >
                            Back to Projects
                        </Button>
                    </Link>
                    <h1 className="text-5xl font-bold mb-4">{project.title}</h1>
                    {project.featured && (
                        <Tag color="gold" className="text-base px-4 py-1">
                            Featured Project
                        </Tag>
                    )}
                </div>
            </section>

            {/* Project Content */}
            <section className="py-20">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-lg shadow-lg p-8">
                        {/* Project Image */}
                        {project.imageUrl && (
                            <div className="mb-8">
                                <img
                                    src={project.imageUrl}
                                    alt={project.title}
                                    className="w-full h-96 object-cover rounded-lg"
                                />
                            </div>
                        )}

                        {/* Description */}
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold mb-4">About This Project</h2>
                            <p className="text-gray-700 text-lg leading-relaxed">
                                {project.description || "No description available."}
                            </p>
                        </div>

                        <Divider />

                        {/* Technologies */}
                        {technologies.length > 0 && (
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold mb-4">Technologies Used</h2>
                                <div className="flex flex-wrap gap-2">
                                    {technologies.map((tech: string, index: number) => (
                                        <Tag key={index} color="blue" className="text-base px-4 py-1">
                                            {tech.trim()}
                                        </Tag>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Links */}
                        {(project.liveUrl || project.githubUrl) && (
                            <>
                                <Divider />
                                <div className="flex gap-4 flex-wrap">
                                    {project.liveUrl && (
                                        <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                                            <Button type="primary" size="large" icon={<GlobalOutlined />}>
                                                View Live Demo
                                            </Button>
                                        </a>
                                    )}
                                    {project.githubUrl && (
                                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                                            <Button size="large" icon={<GithubOutlined />}>
                                                View Source Code
                                            </Button>
                                        </a>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
