import { NextRequest, NextResponse } from "next/server";
import { CognitoIdentityProviderClient, ConfirmSignUpCommand } from "@aws-sdk/client-cognito-identity-provider";

const cognitoClient = new CognitoIdentityProviderClient({
    region: process.env.AWS_REGION!,
});

export async function POST(request: NextRequest) {
    try {
        const { email, code } = await request.json();

        if (!email || !code) {
            return NextResponse.json({ error: "Email and code are required" }, { status: 400 });
        }

        const command = new ConfirmSignUpCommand({
            ClientId: process.env.COGNITO_CLIENT_ID!,
            Username: email,
            ConfirmationCode: code,
        });

        await cognitoClient.send(command);

        return NextResponse.json({ message: "Email verified successfully" });
    } catch (error: any) {
        console.error("Verification error:", error);
        return NextResponse.json(
            { error: error.message || "Verification failed" },
            { status: 500 }
        );
    }
}
