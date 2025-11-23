"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Drawer } from "antd";
import { MenuOutlined, UserOutlined } from "@ant-design/icons";
import { useSession } from "next-auth/react";

export default function Navbar() {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const { data: session } = useSession();
    const router = useRouter();

    const navLinks = [
        { href: "/", label: "Home" },
        { href: "/about", label: "About" },
        { href: "/projects", label: "Projects" },
    ];

    const handleAdminClick = () => {
        router.push("/admin");
    };

    const handleLoginClick = () => {
        router.push("/login");
    };

    return (
        <nav className="sticky top-0 z-50 bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo/Brand */}
                    <Link href="/" className="flex items-center">
                        <span className="text-2xl font-bold text-primary">DLM</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-gray-700 hover:text-primary transition-colors font-medium"
                            >
                                {link.label}
                            </Link>
                        ))}
                        {session ? (
                            <Button
                                type="primary"
                                icon={<UserOutlined />}
                                onClick={handleAdminClick}
                            >
                                {session.user?.name || "Admin"}
                            </Button>
                        ) : (
                            <Button
                                type="default"
                                icon={<UserOutlined />}
                                onClick={handleLoginClick}
                            >
                                Login
                            </Button>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <Button
                            type="text"
                            icon={<MenuOutlined />}
                            onClick={() => setDrawerOpen(true)}
                        />
                    </div>
                </div>
            </div>

            {/* Mobile Drawer */}
            <Drawer
                title="Menu"
                placement="right"
                onClose={() => setDrawerOpen(false)}
                open={drawerOpen}
            >
                <div className="flex flex-col space-y-4">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setDrawerOpen(false)}
                            className="text-gray-700 hover:text-primary transition-colors font-medium text-lg"
                        >
                            {link.label}
                        </Link>
                    ))}
                    {session ? (
                        <Button
                            type="primary"
                            icon={<UserOutlined />}
                            block
                            onClick={() => {
                                setDrawerOpen(false);
                                handleAdminClick();
                            }}
                        >
                            {session.user?.name || "Admin"}
                        </Button>
                    ) : (
                        <Button
                            type="default"
                            icon={<UserOutlined />}
                            block
                            onClick={() => {
                                setDrawerOpen(false);
                                handleLoginClick();
                            }}
                        >
                            Login
                        </Button>
                    )}
                </div>
            </Drawer>
        </nav>
    );
}
