"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, Spin } from "antd";
import { useEffect } from "react";

export default function ClientDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/client/login");
        }
    }, [status, router]);

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spin size="large" />
            </div>
        );
    }

    // Allow both clients and admins to access this dashboard
    if (!session) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">
                        Welcome back, {session.user?.name}!
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Your client portal dashboard
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card title="Profile Information" className="shadow-sm">
                        <p><strong>Name:</strong> {session.user?.name}</p>
                        <p><strong>Email:</strong> {session.user?.email}</p>
                        <p><strong>Role:</strong> Client</p>
                    </Card>

                    <Card title="My Projects" className="shadow-sm">
                        <p className="text-gray-600">No projects yet</p>
                    </Card>

                    <Card title="Recent Activity" className="shadow-sm">
                        <p className="text-gray-600">No recent activity</p>
                    </Card>
                </div>

                <div className="mt-8">
                    <Card title="Get Started" className="shadow-sm">
                        <p className="mb-4">
                            Welcome to your client portal! Here you can view your projects,
                            track progress, and communicate with our team.
                        </p>
                        <p className="text-gray-600">
                            More features coming soon...
                        </p>
                    </Card>
                </div>
            </div>
        </div>
    );
}
