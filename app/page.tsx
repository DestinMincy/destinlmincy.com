import { Button } from "antd";
import Link from "next/link";
import ProjectCard from "@/components/ProjectCard";
import { ArrowRightOutlined } from "@ant-design/icons";

async function getFeaturedProjects() {
    try {
        const res = await fetch("http://localhost:3000/api/projects?featured=true&limit=3", {
            cache: "no-store",
        });
        if (!res.ok) return [];
        const data = await res.json();
        return data.data || [];
    } catch (error) {
        console.error("Failed to fetch featured projects:", error);
        return [];
    }
}

export default async function Home() {
    const featuredProjects = await getFeaturedProjects();

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 text-white py-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-6xl font-bold font-serif mb-6">
                            Destin L. Mincy
                        </h1>
                        <p className="text-3xl font-sans mb-4 text-blue-100">
                            Web Developer & AI Engineer
                        </p>
                        <p className="text-xl mb-8 text-white/90 max-w-3xl mx-auto">
                            Helping small businesses and startups turn big ideas into reality through
                            custom client portals, AI-powered automation, and rock-solid solutions.
                        </p>
                        <div className="flex gap-4 justify-center flex-wrap">
                            <Link href="/projects">
                                <Button type="primary" size="large" className="bg-white text-blue-600 hover:bg-gray-100">
                                    View Portfolio <ArrowRightOutlined />
                                </Button>
                            </Link>
                            <Link href="/about">
                                <Button size="large" className="bg-transparent text-white border-white hover:bg-white/10">
                                    Learn More
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Projects Section */}
            {featuredProjects.length > 0 && (
                <section className="py-20 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-bold mb-4">Featured Projects</h2>
                            <p className="text-xl text-gray-600">
                                Showcasing innovative solutions and successful implementations
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {featuredProjects.map((project: any) => (
                                <ProjectCard key={project.id} project={project} />
                            ))}
                        </div>
                        <div className="text-center mt-12">
                            <Link href="/projects">
                                <Button type="primary" size="large">
                                    View All Projects <ArrowRightOutlined />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* CTA Section */}
            <section className="py-20 bg-blue-600 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl font-bold mb-6">Ready to Collaborate?</h2>
                    <p className="text-xl mb-8 max-w-2xl mx-auto">
                        Let's discuss how we can work together to achieve your business goals
                        and drive innovation.
                    </p>
                    <Link href="/about">
                        <Button type="primary" size="large" className="bg-white text-blue-600 hover:bg-gray-100">
                            Get in Touch
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    );
}
