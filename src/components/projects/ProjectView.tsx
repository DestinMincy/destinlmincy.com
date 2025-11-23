"use client";

import { Tabs, Card, Typography, Tag, Button } from "antd";
import { GithubOutlined, LinkOutlined, CalendarOutlined } from "@ant-design/icons";
import RepositoryBrowser from "./RepositoryBrowser";
import MilestoneTracker from "./MilestoneTracker";

const { Title, Paragraph } = Typography;

interface ProjectViewProps {
    project: any;
    milestones: any[];
}

export default function ProjectView({ project, milestones }: ProjectViewProps) {
    const items = [
        {
            key: 'overview',
            label: 'Overview',
            children: (
                <div className="space-y-6">
                    <Card title="Project Details" className="shadow-sm">
                        <Title level={4}>{project.title}</Title>
                        <Paragraph className="text-gray-600 text-lg">
                            {project.description}
                        </Paragraph>

                        <div className="flex flex-wrap gap-2 my-4">
                            {project.technologies.map((tech: string) => (
                                <Tag key={tech} color="blue">{tech}</Tag>
                            ))}
                        </div>

                        <div className="flex gap-4 mt-6">
                            {project.liveUrl && (
                                <Button type="primary" icon={<LinkOutlined />} href={project.liveUrl} target="_blank">
                                    View Live Site
                                </Button>
                            )}
                            {project.githubUrl && (
                                <Button icon={<GithubOutlined />} href={project.githubUrl} target="_blank">
                                    GitHub Repo
                                </Button>
                            )}
                        </div>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card title="Status" size="small">
                            <div className="text-center py-4">
                                <Tag color={project.featured ? "gold" : "blue"} className="text-lg px-4 py-1">
                                    {project.featured ? "Featured Project" : "Active"}
                                </Tag>
                            </div>
                        </Card>
                        <Card title="Timeline" size="small">
                            <div className="flex items-center justify-center gap-2 py-4 text-gray-600">
                                <CalendarOutlined />
                                <span>Started: {new Date(project.createdAt).toLocaleDateString()}</span>
                            </div>
                        </Card>
                    </div>
                </div>
            ),
        },
        {
            key: 'milestones',
            label: 'Milestones',
            children: <MilestoneTracker milestones={milestones} />,
        },
        {
            key: 'code',
            label: 'Repository',
            children: project.repositoryUrl ? (
                <RepositoryBrowser projectId={project.id} />
            ) : (
                <Card className="text-center py-12">
                    <p className="text-gray-500">No repository linked to this project.</p>
                </Card>
            ),
        },
    ];

    return (
        <div className="max-w-7xl mx-auto p-6">
            <Tabs defaultActiveKey="overview" items={items} size="large" />
        </div>
    );
}
