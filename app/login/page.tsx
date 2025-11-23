"use client";

import { Button, Form, Input, Card, Typography, Alert, Divider } from "antd";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense, useEffect } from "react";
import { UserOutlined, LockOutlined, GoogleOutlined, GithubOutlined, LinkedinOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: session, status } = useSession();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState<"admin" | "client">("client");

    // Redirect if already logged in - happens before render
    useEffect(() => {
        if (status === "authenticated" && session) {
            // Role-based redirect
            const role = (session.user as any)?.role;
            if (role === "admin") {
                router.replace("/admin");
            } else {
                router.replace("/client");
            }
        }
    }, [status, session, router]);

    // Don't render anything while loading or if authenticated (redirecting)
    if (status === "loading" || status === "authenticated") {
        return (
            <Card style={{ width: 500, maxWidth: "95vw" }}>
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                    <Typography.Text>Loading...</Typography.Text>
                </div>
            </Card>
        );
    }

    const onAdminFinish = async (values: any) => {
        setLoading(true);
        setError("");

        const result = await signIn("admin-credentials", {
            username: values.username,
            password: values.password,
            redirect: false,
        });

        if (result?.error) {
            setError("Invalid username or password");
            setLoading(false);
        } else {
            // Use client-side navigation for SPA experience
            router.push("/admin");
        }
    };

    const handleOAuthSignIn = async (provider: string) => {
        setLoading(true);
        await signIn(provider, { callbackUrl: "/client" });
    };

    const handleCognitoSignIn = async () => {
        setLoading(true);
        await signIn("cognito", { callbackUrl: "/client" });
    };

    return (
        <Card style={{ width: 500, maxWidth: "95vw" }}>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
                <Title level={2}>Welcome</Title>
                <Text type="secondary">Sign in to your account</Text>
            </div>

            {/* Tab Selector */}
            <div style={{ display: "flex", marginBottom: 24, borderBottom: "1px solid #f0f0f0" }}>
                <div
                    onClick={() => setActiveTab("client")}
                    style={{
                        flex: 1,
                        padding: "12px 0",
                        textAlign: "center",
                        cursor: "pointer",
                        borderBottom: activeTab === "client" ? "2px solid #2776EA" : "none",
                        color: activeTab === "client" ? "#2776EA" : "#666",
                        fontWeight: activeTab === "client" ? 600 : 400,
                    }}
                >
                    Client Login
                </div>
                <div
                    onClick={() => setActiveTab("admin")}
                    style={{
                        flex: 1,
                        padding: "12px 0",
                        textAlign: "center",
                        cursor: "pointer",
                        borderBottom: activeTab === "admin" ? "2px solid #2776EA" : "none",
                        color: activeTab === "admin" ? "#2776EA" : "#666",
                        fontWeight: activeTab === "admin" ? 600 : 400,
                    }}
                >
                    Admin Login
                </div>
            </div>

            {error && (
                <Alert
                    message={error}
                    type="error"
                    showIcon
                    style={{ marginBottom: 24 }}
                    closable
                    onClose={() => setError("")}
                />
            )}

            {/* Client Login Section */}
            {activeTab === "client" && (
                <div>
                    <Button
                        type="primary"
                        icon={<LockOutlined />}
                        onClick={handleCognitoSignIn}
                        loading={loading}
                        block
                        size="large"
                        style={{ marginBottom: 16 }}
                    >
                        Sign In with Cognito
                    </Button>

                    <Divider>Or continue with</Divider>

                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        <Button
                            icon={<GoogleOutlined />}
                            onClick={() => handleOAuthSignIn("google")}
                            loading={loading}
                            block
                            size="large"
                        >
                            Sign in with Google
                        </Button>
                        <Button
                            icon={<GithubOutlined />}
                            onClick={() => handleOAuthSignIn("github")}
                            loading={loading}
                            block
                            size="large"
                        >
                            Sign in with GitHub
                        </Button>
                        <Button
                            icon={<LinkedinOutlined />}
                            onClick={() => handleOAuthSignIn("linkedin")}
                            loading={loading}
                            block
                            size="large"
                        >
                            Sign in with LinkedIn
                        </Button>
                    </div>
                </div>
            )}

            {/* Admin Login Section */}
            {activeTab === "admin" && (
                <Form
                    name="admin-login"
                    onFinish={onAdminFinish}
                    layout="vertical"
                >
                    <Form.Item
                        label="Username"
                        name="username"
                        rules={[{ required: true, message: "Please input your username!" }]}
                    >
                        <Input prefix={<UserOutlined />} />
                    </Form.Item>

                    <Form.Item
                        label="Password"
                        name="password"
                        rules={[{ required: true, message: "Please input your password!" }]}
                    >
                        <Input.Password prefix={<LockOutlined />} />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block size="large" loading={loading}>
                            Log in
                        </Button>
                    </Form.Item>
                </Form>
            )}
        </Card>
    );
}

export default function LoginPage() {
    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#f0f2f5", padding: "20px" }}>
            <Suspense fallback={<div>Loading...</div>}>
                <LoginForm />
            </Suspense>
        </div>
    );
}
