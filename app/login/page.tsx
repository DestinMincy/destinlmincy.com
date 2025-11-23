"use client";

import { Button, Form, Input, Card, Typography, Alert } from "antd";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

const { Title } = Typography;

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const onFinish = async (values: any) => {
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
            // Force full reload to ensure session is picked up
            window.location.href = "/admin";
        }
    };

    return (
        <Card style={{ width: 400 }}>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
                <Title level={3}>Admin Login</Title>
            </div>

            {error && (
                <Alert
                    message={error}
                    type="error"
                    showIcon
                    style={{ marginBottom: 24 }}
                />
            )}

            <Form
                name="login"
                onFinish={onFinish}
                layout="vertical"
            >
                <Form.Item
                    label="Username"
                    name="username"
                    rules={[{ required: true, message: "Please input your username!" }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Password"
                    name="password"
                    rules={[{ required: true, message: "Please input your password!" }]}
                >
                    <Input.Password />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" block loading={loading}>
                        Log in
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
}

export default function LoginPage() {
    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#f0f2f5" }}>
            <Suspense fallback={<div>Loading...</div>}>
                <LoginForm />
            </Suspense>
        </div>
    );
}
