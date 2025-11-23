import { NextRequest, NextResponse } from "next/server";
import { CognitoIdentityProviderClient, ConfirmForgotPasswordCommand } from "@aws-sdk/client-cognito-identity-provider";

const cognitoClient = new CognitoIdentityProviderClient({
    region: process.env.AWS_REGION!,
});

export async function POST(request: NextRequest) {
    try {
        const { email, code, password } = await request.json();

        if (!email || !code || !password) {
            return NextResponse.json({ error: "Email, code, and password are required" }, { status: 400 });
        }

        const command = new ConfirmForgotPasswordCommand({
            ClientId: process.env.COGNITO_CLIENT_ID!,
            Username: email,
            ConfirmationCode: code,
            Password: password,
        });

        await cognitoClient.send(command);

        return NextResponse.json({ message: "Password reset successfully" });
    } catch (error: any) {
        console.error("Reset password error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to reset password" },
            { status: 500 }
        );
    }
}
