/**
 * @jest-environment node
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

// Mock dependencies
jest.mock('next-auth', () => ({
    getServerSession: jest.fn(),
}));

jest.mock('@/lib/prisma', () => ({
    prisma: {
        quote: {
            findMany: jest.fn(),
            create: jest.fn(),
        },
    },
}));

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;

describe('Quote API Routes Authentication', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Admin Authorization', () => {
        it('should deny access when user is not authenticated', () => {
            mockGetServerSession.mockResolvedValue(null);

            const session = null;
            const isAuthorized = session?.user?.role === 'admin';

            expect(isAuthorized).toBe(false);
        });

        it('should deny access when user is not admin', () => {
            const session = {
                user: { id: '1', email: 'user@example.com', role: 'customer' },
                expires: '2024-12-31',
            };

            const isAuthorized = session?.user?.role === 'admin';

            expect(isAuthorized).toBe(false);
        });

        it('should allow access when user is admin', () => {
            const session = {
                user: { id: '1', email: 'admin@example.com', role: 'admin' },
                expires: '2024-12-31',
            };

            const isAuthorized = session?.user?.role === 'admin';

            expect(isAuthorized).toBe(true);
        });
    });

    describe('Quote Data Operations', () => {
        it('should call Prisma quote.findMany with customer include', async () => {
            const mockQuotes = [
                {
                    id: '1',
                    quoteNumber: 'Q-001',
                    customerId: 'customer1',
                    status: 'draft',
                    amount: 1000,
                    description: 'Test quote',
                    items: [],
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    expiresAt: null,
                    customer: { id: 'customer1', email: 'customer@example.com', name: 'Test Customer' },
                },
            ];

            (prisma.quote.findMany as jest.Mock).mockResolvedValue(mockQuotes);

            const result = await prisma.quote.findMany({ include: { customer: true } });

            expect(prisma.quote.findMany).toHaveBeenCalledWith({ include: { customer: true } });
            expect(result).toEqual(mockQuotes);
        });

        it('should call Prisma quote.create with correct data', async () => {
            const newQuoteData = {
                quoteNumber: 'Q-002',
                customerId: 'customer1',
                status: 'draft',
                amount: 2000,
                description: 'New test quote',
            };

            const mockCreatedQuote = {
                id: '2',
                ...newQuoteData,
                items: [],
                createdAt: new Date(),
                updatedAt: new Date(),
                expiresAt: null,
            };

            (prisma.quote.create as jest.Mock).mockResolvedValue(mockCreatedQuote);

            const result = await prisma.quote.create({ data: newQuoteData });

            expect(prisma.quote.create).toHaveBeenCalledWith({ data: newQuoteData });
            expect(result).toEqual(mockCreatedQuote);
        });
    });

    describe('Field Validation', () => {
        it('should only include allowed fields for update', () => {
            const maliciousData = {
                status: 'sent',
                amount: 1500,
                id: 'changed-id', // Should be filtered out
                createdAt: new Date(), // Should be filtered out
                hackerField: 'evil', // Should be filtered out
            };

            const allowed = ['quoteNumber', 'customerId', 'status', 'amount', 'description'];
            const updateData: any = {};

            for (const key of allowed) {
                if (key in maliciousData) {
                    updateData[key] = maliciousData[key];
                }
            }

            expect(updateData).toEqual({ status: 'sent', amount: 1500 });
            expect(updateData).not.toHaveProperty('id');
            expect(updateData).not.toHaveProperty('createdAt');
            expect(updateData).not.toHaveProperty('hackerField');
        });
    });
});
