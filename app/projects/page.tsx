import { Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import ProjectCard from "@/components/ProjectCard";

async function getProjects() {
    try {
        const res = await fetch("http://localhost:3000/api/projects", {
            cache: "no-store",
        });
        if (!res.ok) return [];
        const data = await res.json();
        return data.data || [];
    } catch (error) {
        console.error("Failed to fetch projects:", error);
        return [];
    }
}

export default async function Projects() {
    const projects = await getProjects();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-5xl font-bold mb-6 text-center">Projects</h1>
                    <p className="text-xl text-center max-w-3xl mx-auto">
                        Explore my portfolio of innovative solutions, ranging from AI-powered platforms
                        to custom web applications.
                    </p>
                </div>
            </section>

            {/* Projects Grid */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {projects.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-2xl text-gray-600 mb-4">No projects available yet.</p>
                            <p className="text-gray-500">Check back soon for updates!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {projects.map((project: any) => (
                                <ProjectCard key={project.id} project={project} />
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
