import Link from "next/link";
import { Card, Tag, Button } from "antd";
import { EyeOutlined, GithubOutlined, LinkOutlined } from "@ant-design/icons";

interface ProjectCardProps {
    project: {
        id: string;
        title: string;
        slug: string;
        description: string | null;
        imageUrl: string | null;
        technologies: string | null;
        featured: boolean;
    };
}

export default function ProjectCard({ project }: ProjectCardProps) {
    const technologies = project.technologies ? project.technologies.split(",") : [];

    return (
        <Card
            hoverable
            cover={
                project.imageUrl ? (
                    <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <img
                            alt={project.title}
                            src={project.imageUrl}
                            className="object-cover h-full w-full"
                        />
                    </div>
                ) : (
                    <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white text-4xl font-bold">
                            {project.title.charAt(0)}
                        </span>
                    </div>
                )
            }
            className="h-full flex flex-col"
        >
            <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-3">
                    {project.description || "No description available."}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                    {technologies.map((tech, index) => (
                        <Tag key={index} color="blue">
                            {tech.trim()}
                        </Tag>
                    ))}
                </div>
            </div>
            <div className="flex gap-2">
                <Link href={`/projects/${project.slug}`} className="flex-1">
                    <Button type="primary" icon={<EyeOutlined />} block>
                        View Details
                    </Button>
                </Link>
            </div>
        </Card>
    );
}
