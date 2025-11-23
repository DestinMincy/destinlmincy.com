import Link from "next/link";
import { GithubOutlined, LinkedinOutlined, MailOutlined } from "@ant-design/icons";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-900 text-white mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* About Section */}
                    <div>
                        <h3 className="text-xl font-bold mb-4">Destin L. Mincy</h3>
                        <p className="text-gray-400">
                            Web Developer & AI Engineer specializing in custom client portals,
                            AI automation, and innovative solutions.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-xl font-bold mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                                    About
                                </Link>
                            </li>
                            <li>
                                <Link href="/projects" className="text-gray-400 hover:text-white transition-colors">
                                    Projects
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Social Links */}
                    <div>
                        <h3 className="text-xl font-bold mb-4">Connect</h3>
                        <div className="flex space-x-4">
                            <a
                                href="https://github.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-white transition-colors text-2xl"
                            >
                                <GithubOutlined />
                            </a>
                            <a
                                href="https://linkedin.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-white transition-colors text-2xl"
                            >
                                <LinkedinOutlined />
                            </a>
                            <a
                                href="mailto:contact@destinlmincy.com"
                                className="text-gray-400 hover:text-white transition-colors text-2xl"
                            >
                                <MailOutlined />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                    <p>&copy; {currentYear} Destin L. Mincy. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
