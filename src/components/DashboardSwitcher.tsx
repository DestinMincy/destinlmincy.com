"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button, Tooltip } from "antd";
import { SwapOutlined, UserOutlined, CrownOutlined } from "@ant-design/icons";
import { useSession } from "next-auth/react";

export default function DashboardSwitcher() {
    const router = useRouter();
    const pathname = usePathname();
    const { data: session } = useSession();
    const [currentView, setCurrentView] = useState<"admin" | "client">("admin");

    // Determine current view based on pathname
    useEffect(() => {
        if (pathname?.startsWith("/admin")) {
            setCurrentView("admin");
        } else if (pathname?.startsWith("/client")) {
            setCurrentView("client");
        }
    }, [pathname]);

    // Only show for admin users
    const isAdmin = (session?.user as any)?.role === "admin";

    // Only show when on dashboard routes (admin or client)
    const isOnDashboard = pathname?.startsWith("/admin") || pathname?.startsWith("/client");

    if (!isAdmin || !isOnDashboard) {
        return null;
    }

    const handleSwitch = () => {
        if (currentView === "admin") {
            router.push("/client");
        } else {
            router.push("/admin");
        }
    };

    return (
        <Tooltip title={currentView === "admin" ? "Switch to Client View" : "Switch to Admin View"}>
            <Button
                icon={currentView === "admin" ? <UserOutlined /> : <CrownOutlined />}
                onClick={handleSwitch}
                type="default"
            >
                {currentView === "admin" ? "Client View" : "Admin View"}
            </Button>
        </Tooltip>
    );
}
