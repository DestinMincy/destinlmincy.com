import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get client record
        const client = await prisma.client.findUnique({
            where: { email: session.user.email! },
        });

        if (!client) {
            return NextResponse.json({ error: 'Client not found' }, { status: 404 });
        }

        // Fetch the quote
        const quote = await prisma.quote.findUnique({
            where: { id: params.id },
            include: { client: true },
        });

        if (!quote) {
            return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
        }

        // Ensure client can only access their own quotes
        if (quote.clientId !== client.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        return NextResponse.json(quote);
    } catch (error) {
        console.error('Error fetching client quote:', error);
        return NextResponse.json(
            { error: 'Failed to fetch quote' },
            { status: 500 }
        );
    }
}
