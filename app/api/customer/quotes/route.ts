import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get customer record
        const customer = await prisma.customer.findUnique({
            where: { email: session.user.email! },
        });

        if (!customer) {
            return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
        }

        // Fetch only this customer's quotes
        const quotes = await prisma.quote.findMany({
            where: { customerId: customer.id },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                quoteNumber: true,
                status: true,
                amount: true,
                description: true,
                createdAt: true,
                expiresAt: true,
            },
        });

        return NextResponse.json(quotes);
    } catch (error) {
        console.error('Error fetching customer quotes:', error);
        return NextResponse.json(
            { error: 'Failed to fetch quotes' },
            { status: 500 }
        );
    }
}
