"use client";

import { signIn } from "next-auth/react";
import { Button, Card, Divider } from "antd";
import { LockOutlined, GithubOutlined, LinkedinOutlined, GoogleOutlined } from "@ant-design/icons";
import { useState } from "react";
import Link from "next/link";

export default function CustomerLogin() {
    const [loading, setLoading] = useState(false);

    // Cognito uses OAuth, so we redirect to Cognito Hosted UI
    const handleCognitoSignIn = async () => {
        setLoading(true);
        await signIn("cognito", { callbackUrl: "/customer/dashboard" });
    };

    const handleOAuthSignIn = async (provider: string) => {
        setLoading(true);
        await signIn(provider, { callbackUrl: "/customer/dashboard" });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
            <Card className="w-full max-w-md shadow-lg">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
                    <p className="mt-2 text-gray-600">Sign in to your customer portal</p>
                </div>

                {/* Primary Cognito Sign-In */}
                <Button
                    type="primary"
                    icon={<LockOutlined />}
                    onClick={handleCognitoSignIn}
                    loading={loading}
                    block
                    size="large"
                    className="mb-4"
                >
                    Sign In with Cognito
                </Button>

                <Divider>Or continue with</Divider>

                {/* OAuth Providers */}
                <div className="space-y-3">
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

                <div className="mt-6 text-center">
                    <p className="text-gray-600">
                        Don't have an account?{" "}
                        <Link href="/customer/register" className="text-primary hover:text-primary-dark font-medium">
                            Sign up
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
