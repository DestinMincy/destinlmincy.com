"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Card, Form, Input, message } from "antd";
import { LockOutlined, NumberOutlined, MailOutlined } from "@ant-design/icons";
import Link from "next/link";

export default function ResetPassword() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const [form] = Form.useForm();

    useEffect(() => {
        const email = searchParams.get("email");
        if (email) {
            form.setFieldsValue({ email });
        }
    }, [searchParams, form]);

    const onFinish = async (values: { email: string; code: string; password: string }) => {
        setLoading(true);
        try {
            const response = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            if (response.ok) {
                message.success("Password reset successfully! Please log in.");
                router.push("/customer/login");
            } else {
                const data = await response.json();
                message.error(data.error || "Failed to reset password");
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
                    <h1 className="text-3xl font-bold text-gray-900">Reset Password</h1>
                    <p className="mt-2 text-gray-600">Enter your new password</p>
                </div>

                <Form
                    form={form}
                    name="reset-password"
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

                    <Form.Item
                        name="password"
                        rules={[
                            { required: true, message: "Please input your new password!" },
                            { min: 8, message: "Password must be at least 8 characters!" },
                            {
                                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
                                message: "Password must contain uppercase, lowercase, and number!",
                            },
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="New Password"
                            autoComplete="new-password"
                        />
                    </Form.Item>

                    <Form.Item
                        name="confirmPassword"
                        dependencies={["password"]}
                        rules={[
                            { required: true, message: "Please confirm your password!" },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue("password") === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error("Passwords do not match!"));
                                },
                            }),
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Confirm New Password"
                            autoComplete="new-password"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} block>
                            Reset Password
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
