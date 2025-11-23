"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Form, Input, message } from "antd";
import { MailOutlined } from "@ant-design/icons";
import Link from "next/link";

export default function ForgotPassword() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const onFinish = async (values: { email: string }) => {
        setLoading(true);
        try {
            const response = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            if (response.ok) {
                message.success("If an account exists, a reset code has been sent.");
                router.push(`/customer/reset-password?email=${encodeURIComponent(values.email)}`);
            } else {
                const data = await response.json();
                message.error(data.error || "Failed to send reset code");
            }
        } catch (error) {
            message.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
            <Card className="w-full max-w-md shadow-lg">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Forgot Password</h1>
                    <p className="mt-2 text-gray-600">Enter your email to reset your password</p>
                </div>

                <Form
                    name="forgot-password"
                    onFinish={onFinish}
                    layout="vertical"
                    size="large"
                >
                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: "Please input your email!" },
                            { type: "email", message: "Please enter a valid email!" },
                        ]}
                    >
                        <Input
                            prefix={<MailOutlined />}
                            placeholder="Email"
                            autoComplete="email"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} block>
                            Send Reset Code
                        </Button>
                    </Form.Item>
                </Form>

                <div className="mt-4 text-center">
                    <Link href="/customer/login" className="text-sm text-gray-500 hover:text-gray-700">
                        ← Back to login
                    </Link>
                </div>
            </Card>
        </div>
    );
}
