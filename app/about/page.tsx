import { Button, Card } from "antd";
import Link from "next/link";
import {
    CodeOutlined,
    TeamOutlined,
    RocketOutlined,
    MailOutlined,
    GithubOutlined,
    LinkedinOutlined,
} from "@ant-design/icons";

export default function About() {
    const skills = [
        "Full-Stack Development",
        "AI & Machine Learning Integration",
        "Client Portal Development",
        "Node.js & React",
        "Cloud Infrastructure (AWS)",
        "Database Design",
        "Project Management",
        "Business Automation",
    ];

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-5xl font-bold mb-6">About Me</h1>
                    <p className="text-xl">
                        Web Developer & AI Engineer helping small businesses and startups turn big ideas into reality
                    </p>
                </div>
            </section>

            {/* Bio Section */}
            <section className="py-20 bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="prose prose-lg max-w-none">
                        <h2 className="text-3xl font-bold mb-6">Who I Am</h2>
                        <p className="text-gray-700 text-lg leading-relaxed mb-4">
                            I fell in love with code at 10 years old when I got my hands on Microsoft FrontPage
                            for Windows 3.1. By the time MySpace rolled around in late middle school and early
                            high school, I was the guy everyone came to for custom profiles. Fast forward 17+ years,
                            and I'm a freelance web developer and AI engineer helping small businesses and startups
                            turn big ideas into reality.
                        </p>
                        <p className="text-gray-700 text-lg leading-relaxed mb-4">
                            I specialize in custom client portals, AI-powered automation, and solutions that blend
                            cutting-edge technology with rock-solid reliability. My secret sauce? Attention to detail,
                            relentless efficiency, and a problem-solving mindset that doesn't believe in brick walls.
                        </p>
                        <p className="text-gray-700 text-lg leading-relaxed mb-4">
                            <strong>Communication is everything.</strong> My platform automatically notifies you of
                            every code commit, and I personally keep you updated on progress. I need you to be just
                            as communicative about your vision, expectations, and needs. When challenges arise, we
                            solve them together.
                        </p>
                        <p className="text-gray-700 text-lg leading-relaxed mb-4">
                            I'm driven by advancement—yours and mine. When you succeed, I succeed. That's why I've
                            maintained{" "}
                            <a
                                href="https://theolympiasalon.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 underline"
                            >
                                The Olympia Salon's
                            </a>{" "}
                            website for nearly a decade. Quality isn't negotiable. If you're not satisfied, neither am I.
                        </p>
                        <p className="text-gray-700 text-lg leading-relaxed">
                            I'm always learning new tech (though I'm partial to Node.js and React), but one thing
                            never changes: <strong>I refuse to deliver slop.</strong> Every project gets my best work,
                            every time.
                        </p>
                        <p className="text-gray-700 text-lg leading-relaxed mt-6 font-semibold">
                            Let's build something great together.
                        </p>
                    </div>
                </div>
            </section>

            {/* Skills Section */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-center mb-12">Skills & Expertise</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {skills.map((skill, index) => (
                            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                                <p className="font-medium text-gray-800">{skill}</p>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-20 bg-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-center mb-12">Core Values</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <Card className="text-center hover:shadow-lg transition-shadow">
                            <CodeOutlined className="text-5xl text-blue-600 mb-4" />
                            <h3 className="text-xl font-bold mb-3">Innovation</h3>
                            <p className="text-gray-600">
                                Leveraging cutting-edge technology to create solutions that push boundaries
                                and deliver real value.
                            </p>
                        </Card>
                        <Card className="text-center hover:shadow-lg transition-shadow">
                            <TeamOutlined className="text-5xl text-purple-600 mb-4" />
                            <h3 className="text-xl font-bold mb-3">Collaboration</h3>
                            <p className="text-gray-600">
                                Building strong partnerships through transparent communication and mutual
                                respect.
                            </p>
                        </Card>
                        <Card className="text-center hover:shadow-lg transition-shadow">
                            <RocketOutlined className="text-5xl text-pink-600 mb-4" />
                            <h3 className="text-xl font-bold mb-3">Excellence</h3>
                            <p className="text-gray-600">
                                Committed to delivering high-quality work that exceeds expectations and
                                drives success.
                            </p>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Contact CTA */}
            <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl font-bold mb-6">Let's Work Together</h2>
                    <p className="text-xl mb-8">
                        Interested in collaborating or learning more about what I do?
                    </p>
                    <div className="flex gap-4 justify-center flex-wrap">
                        <a href="mailto:contact@destinlmincy.com">
                            <Button
                                type="primary"
                                size="large"
                                icon={<MailOutlined />}
                                className="bg-white text-blue-600 hover:bg-gray-100"
                            >
                                Send Email
                            </Button>
                        </a>
                        <a
                            href="https://github.com"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Button
                                size="large"
                                icon={<GithubOutlined />}
                                className="bg-transparent text-white border-white hover:bg-white/10"
                            >
                                GitHub
                            </Button>
                        </a>
                        <a
                            href="https://linkedin.com"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Button
                                size="large"
                                icon={<LinkedinOutlined />}
                                className="bg-transparent text-white border-white hover:bg-white/10"
                            >
                                LinkedIn
                            </Button>
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}
