"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Form, Input, message } from "antd";
import { NumberOutlined, MailOutlined } from "@ant-design/icons";
import Link from "next/link";

export default function VerifyEmail() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const onFinish = async (values: { email: string; code: string }) => {
        setLoading(true);
        try {
            const response = await fetch("/api/auth/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            if (response.ok) {
                message.success("Email verified successfully! You can now log in.");
                router.push("/client/login");
            } else {
                const data = await response.json();
                message.error(data.error || "Verification failed");
            }
        } catch (error) {
            message.error("An error occurred during verification");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
            <Card className="w-full max-w-md shadow-lg">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Verify Email</h1>
                    <p className="mt-2 text-gray-600">Enter the code sent to your email</p>
                </div>

                <Form
                    name="verify-email"
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

                    <Form.Item
                        name="code"
                        rules={[{ required: true, message: "Please input the verification code!" }]}
                    >
                        <Input
                            prefix={<NumberOutlined />}
                            placeholder="Verification Code"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} block>
                            Verify Account
                        </Button>
                    </Form.Item>
                </Form>

                <div className="mt-4 text-center">
                    <Link href="/client/login" className="text-sm text-gray-500 hover:text-gray-700">
                        ← Back to login
                    </Link>
                </div>
            </Card>
        </div>
    );
}
