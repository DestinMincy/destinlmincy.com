"use client";

import { Refine, Authenticated } from "@refinedev/core";
import { ThemedLayoutV2, ThemedTitleV2 } from "@refinedev/antd";
import { authProvider } from "@/providers/auth-provider";
import { dataProvider } from "@/providers/data-provider";
import "@refinedev/antd/dist/reset.css";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Refine
            authProvider={authProvider}
            dataProvider={dataProvider}
            resources={[
                {
                    name: "projects",
                    list: "/admin/projects",
                    create: "/admin/projects/create",
                    edit: "/admin/projects/edit/:id",
                    show: "/admin/projects/show/:id",
                    meta: { canDelete: true },
                },
                {
                    name: "quotes",
                    list: "/admin/quotes",
                    create: "/admin/quotes/create",
                    edit: "/admin/quotes/edit/:id",
                    show: "/admin/quotes/show/:id",
                    meta: { canDelete: true },
                },
            ]}
            options={{
                syncWithLocation: true,
                warnWhenUnsavedChanges: true,
            }}
        >
            <Authenticated key="protected" v3LegacyAuthProviderCompatible={false}>
                <ThemedLayoutV2
                    Title={({ collapsed }) => (
                        <ThemedTitleV2
                            collapsed={collapsed}
                            text="Destin Mincy"
                            icon={<span style={{ fontSize: "24px" }}>🚀</span>}
                        />
                    )}
                >
                    {children}
                </ThemedLayoutV2>
            </Authenticated>
        </Refine>
    );
}
