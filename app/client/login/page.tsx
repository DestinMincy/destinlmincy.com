"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, Spin } from "antd";

export default function ClientLoginRedirect() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to unified login page
        router.replace("/login");
    }, [router]);

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#f0f2f5" }}>
            <Card style={{ textAlign: "center", padding: "40px" }}>
                <Spin size="large" />
                <p style={{ marginTop: 20 }}>Redirecting to login...</p>
            </Card>
        </div>
    );
}
