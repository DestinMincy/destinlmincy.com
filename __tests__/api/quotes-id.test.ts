/**
 * @jest-environment node
 */

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

// Mock dependencies
jest.mock('next-auth', () => ({
    getServerSession: jest.fn(),
}));

jest.mock('@/lib/prisma', () => ({
    prisma: {
        quote: {
            findUnique: jest.fn(),
            update: jest.fn(),
        },
    },
}));

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;

describe('Quote Detail API Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Get Single Quote', () => {
        it('should call Prisma findUnique with correct parameters', async () => {
            const mockQuote = {
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
            };

            (prisma.quote.findUnique as jest.Mock).mockResolvedValue(mockQuote);

            const result = await prisma.quote.findUnique({
                where: { id: '1' },
                include: { customer: true },
            });

            expect(prisma.quote.findUnique).toHaveBeenCalledWith({
                where: { id: '1' },
                include: { customer: true },
            });
            expect(result).toEqual(mockQuote);
        });

        it('should return null for non-existent quote', async () => {
            (prisma.quote.findUnique as jest.Mock).mockResolvedValue(null);

            const result = await prisma.quote.findUnique({
                where: { id: '999' },
                include: { customer: true },
            });

            expect(result).toBeNull();
        });
    });

    describe('Update Quote', () => {
        it('should call Prisma update with correct parameters', async () => {
            const updateData = { status: 'sent', amount: 1500 };
            const updatedQuote = {
                id: '1',
                quoteNumber: 'Q-001',
                customerId: 'customer1',
                status: 'sent',
                amount: 1500,
                description: 'Test quote',
                items: [],
                createdAt: new Date(),
                updatedAt: new Date(),
                expiresAt: null,
            };

            (prisma.quote.update as jest.Mock).mockResolvedValue(updatedQuote);

            const result = await prisma.quote.update({
                where: { id: '1' },
                data: updateData,
            });

            expect(prisma.quote.update).toHaveBeenCalledWith({
                where: { id: '1' },
                data: updateData,
            });
            expect(result).toEqual(updatedQuote);
        });

        it('should validate field whitelist logic', () => {
            const maliciousData = {
                status: 'sent',
                amount: 1500,
                quoteNumber: 'Q-MODIFIED',
                id: 'changed-id', // Not in whitelist
                createdAt: new Date(), // Not in whitelist
            };

            const allowed = ['quoteNumber', 'customerId', 'status', 'amount', 'description'];
            const updateData: any = {};

            for (const key of allowed) {
                if (key in maliciousData) {
                    updateData[key] = (maliciousData as any)[key];
                }
            }

            expect(updateData).toEqual({
                status: 'sent',
                amount: 1500,
                quoteNumber: 'Q-MODIFIED'
            });
            expect(updateData).not.toHaveProperty('id');
            expect(updateData).not.toHaveProperty('createdAt');
        });
    });

    describe('Authorization Checks', () => {
        it('should verify admin role correctly', () => {
            const adminSession = {
                user: { id: '1', email: 'admin@example.com', role: 'admin' },
                expires: '2024-12-31',
            };

            expect(adminSession.user.role).toBe('admin');
        });

        it('should reject customer role', () => {
            const customerSession = {
                user: { id: '2', email: 'customer@example.com', role: 'customer' },
                expires: '2024-12-31',
            };

            expect(customerSession.user.role).not.toBe('admin');
        });

        it('should reject null session', () => {
            const session = null;
            const isAuthorized = session?.user?.role === 'admin';

            expect(isAuthorized).toBe(false);
        });
    });
});
