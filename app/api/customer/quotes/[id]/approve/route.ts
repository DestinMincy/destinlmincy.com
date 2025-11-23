import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
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

        // Fetch the quote
        const quote = await prisma.quote.findUnique({
            where: { id: params.id },
        });

        if (!quote) {
            return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
        }

        // Ensure customer can only approve their own quotes
        if (quote.customerId !== customer.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Check if quote is in a state that can be approved
        if (quote.status !== 'sent') {
            return NextResponse.json(
                { error: 'Quote cannot be approved in its current state' },
                { status: 400 }
            );
        }

        // Update quote status to approved
        const updatedQuote = await prisma.quote.update({
            where: { id: params.id },
            data: {
                status: 'approved',
                updatedAt: new Date(),
            },
        });

        return NextResponse.json({
            message: 'Quote approved successfully',
            quote: updatedQuote,
        });
    } catch (error) {
        console.error('Error approving quote:', error);
        return NextResponse.json(
            { error: 'Failed to approve quote' },
            { status: 500 }
        );
    }
}
