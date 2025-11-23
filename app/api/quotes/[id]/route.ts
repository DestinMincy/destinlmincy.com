import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const quote = await prisma.quote.findUnique({
        where: { id: params.id },
        include: { client: true },
    });
    if (!quote) {
        return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }
    return NextResponse.json(quote);
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const data = await request.json();
    // Only allow specific fields to be updated
    const allowed = ['quoteNumber', 'clientId', 'status', 'amount', 'description'];
    const updateData: any = {};
    for (const key of allowed) {
        if (key in data) updateData[key] = data[key];
    }
    try {
        const updated = await prisma.quote.update({
            where: { id: params.id },
            data: updateData,
        });
        return NextResponse.json(updated);
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }
}
