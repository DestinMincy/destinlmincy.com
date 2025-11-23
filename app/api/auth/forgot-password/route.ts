import { NextRequest, NextResponse } from "next/server";
import { CognitoIdentityProviderClient, ForgotPasswordCommand } from "@aws-sdk/client-cognito-identity-provider";

const cognitoClient = new CognitoIdentityProviderClient({
    region: process.env.AWS_REGION!,
});

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        const command = new ForgotPasswordCommand({
            ClientId: process.env.COGNITO_CLIENT_ID!,
            Username: email,
        });

        await cognitoClient.send(command);

        return NextResponse.json({ message: "Password reset code sent" });
    } catch (error: any) {
        console.error("Forgot password error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to send reset code" },
            { status: 500 }
        );
    }
}
