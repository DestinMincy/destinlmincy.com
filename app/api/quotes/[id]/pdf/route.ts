import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { renderToBuffer } from '@react-pdf/renderer';
import QuotePDF from '@/components/pdf/QuotePDF';
import React from 'react';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        // Check authentication
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch the quote
        const quote = await prisma.quote.findUnique({
            where: { id: params.id },
            include: { customer: true },
        });

        if (!quote) {
            return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
        }

        // Authorization: Admin can view any quote, customers can only view their own
        const isAdmin = session.user.role === 'admin';
        const isOwner = quote.customer?.email === session.user.email;

        if (!isAdmin && !isOwner) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Prepare quote data for PDF
        const quoteData = {
            id: quote.id,
            quoteNumber: quote.quoteNumber,
            status: quote.status,
            amount: quote.amount.toString(),
            description: quote.description || undefined,
            createdAt: quote.createdAt.toISOString(),
            expiresAt: quote.expiresAt?.toISOString(),
            items: quote.items as any,
            customer: {
                name: quote.customer?.name || 'Customer',
                email: quote.customer?.email || '',
            },
        };

        // Generate PDF
        const pdfElement = React.createElement(QuotePDF, { quote: quoteData });
        const pdfBuffer = await renderToBuffer(pdfElement as any);

        // Convert buffer to Uint8Array for NextResponse
        const pdfUint8Array = new Uint8Array(pdfBuffer);

        // Return PDF with appropriate headers
        return new NextResponse(pdfUint8Array, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename="quote-${quote.quoteNumber}.pdf"`,
            },
        });
    } catch (error) {
        console.error('Error generating PDF:', error);
        return NextResponse.json(
            { error: 'Failed to generate PDF' },
            { status: 500 }
        );
    }
}
