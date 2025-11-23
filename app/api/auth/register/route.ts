import { NextRequest, NextResponse } from "next/server";
import { CognitoIdentityProviderClient, SignUpCommand } from "@aws-sdk/client-cognito-identity-provider";
import { prisma } from "@/lib/prisma";

const cognitoClient = new CognitoIdentityProviderClient({
    region: process.env.AWS_REGION!,
});

export async function POST(request: NextRequest) {
    try {
        const { name, email, password } = await request.json();

        // Validate input
        if (!name || !email || !password) {
            return NextResponse.json(
                { error: "Name, email, and password are required" },
                { status: 400 }
            );
        }

        // Register user with AWS Cognito
        const command = new SignUpCommand({
            ClientId: process.env.COGNITO_CLIENT_ID!,
            Username: email,
            Password: password,
            UserAttributes: [
                {
                    Name: "email",
                    Value: email,
                },
                {
                    Name: "name",
                    Value: name,
                },
            ],
        });

        const response = await cognitoClient.send(command);

        // Sync user to local database
        try {
            await prisma.customer.create({
                data: {
                    email,
                    name,
                    cognitoId: response.UserSub,
                    role: "customer",
                },
            });
        } catch (dbError) {
            console.error("Database sync error:", dbError);
            // Note: We don't fail the request here because the user is created in Cognito.
            // The user will be synced on next login via auth.ts callback if this fails.
        }

        return NextResponse.json({
            message: "User registered successfully",
            userSub: response.UserSub,
            userConfirmed: response.UserConfirmed,
        });
    } catch (error: any) {
        console.error("Registration error:", error);

        // Handle specific Cognito errors
        if (error.name === "UsernameExistsException") {
            return NextResponse.json(
                { error: "A user with this email already exists" },
                { status: 409 }
            );
        }

        if (error.name === "InvalidPasswordException") {
            return NextResponse.json(
                { error: "Password does not meet requirements" },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Registration failed. Please try again." },
            { status: 500 }
        );
    }
}
