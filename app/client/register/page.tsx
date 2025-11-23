"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Form, Input, message, Divider } from "antd";
import { MailOutlined, LockOutlined, UserOutlined, GithubOutlined, LinkedinOutlined, GoogleOutlined } from "@ant-design/icons";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function ClientRegister() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const onFinish = async (values: { name: string; email: string; password: string }) => {
        setLoading(true);
        try {
            // TODO: Implement Cognito sign-up API call
            // For now, we'll use a placeholder
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            if (response.ok) {
                message.success("Registration successful! Please check your email to verify your account.");
                router.push("/client/verify-email");
            } else {
                const data = await response.json();
                message.error(data.error || "Registration failed");
            }
        } catch (error) {
            message.error("An error occurred during registration");
        } finally {
            setLoading(false);
        }
    };

    const handleOAuthSignIn = async (provider: string) => {
        setLoading(true);
        await signIn(provider, { callbackUrl: "/client" });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
            <Card className="w-full max-w-md shadow-lg">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
                    <p className="mt-2 text-gray-600">Join us to get started</p>
                </div>

                <Form
                    name="client-register"
                    onFinish={onFinish}
                    layout="vertical"
                    size="large"
                >
                    <Form.Item
                        name="name"
                        rules={[{ required: true, message: "Please input your name!" }]}
                    >
                        <Input
                            prefix={<UserOutlined />}
                            placeholder="Full Name"
                            autoComplete="name"
                        />
                    </Form.Item>

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
                        name="password"
                        rules={[
                            { required: true, message: "Please input your password!" },
                            { min: 8, message: "Password must be at least 8 characters!" },
                            {
                                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
                                message: "Password must contain uppercase, lowercase, and number!",
                            },
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Password"
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
                            placeholder="Confirm Password"
                            autoComplete="new-password"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} block>
                            Create Account
                        </Button>
                    </Form.Item>
                </Form>

                <Divider>Or sign up with</Divider>

                <div className="space-y-3">
                    <Button
                        icon={<GoogleOutlined />}
                        onClick={() => handleOAuthSignIn("google")}
                        block
                        size="large"
                    >
                        Sign up with Google
                    </Button>
                    <Button
                        icon={<GithubOutlined />}
                        onClick={() => handleOAuthSignIn("github")}
                        block
                        size="large"
                    >
                        Sign up with GitHub
                    </Button>
                    <Button
                        icon={<LinkedinOutlined />}
                        onClick={() => handleOAuthSignIn("linkedin")}
                        block
                        size="large"
                    >
                        Sign up with LinkedIn
                    </Button>
                </div>

                <div className="mt-6 text-center">
                    <p className="text-gray-600">
                        Already have an account?{" "}
                        <Link href="/client/login" className="text-primary hover:text-primary-dark font-medium">
                            Sign in
                        </Link>
                    </p>
                </div>

                <div className="mt-4 text-center">
                    <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
                        ← Back to home
                    </Link>
                </div>
            </Card>
        </div>
    );
}
