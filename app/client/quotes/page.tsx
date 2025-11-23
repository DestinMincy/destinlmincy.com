"use client";

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Table, Button, Tag, Card } from 'antd';

interface Quote {
    id: string;
    quoteNumber: string;
    status: string;
    amount: any;
    description?: string;
    createdAt: string;
}

export default function ClientQuotesPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/client/login');
            return;
        }

        if (status === 'authenticated') {
            fetch('/api/client/quotes')
                .then((res) => res.json())
                .then((data) => {
                    setQuotes(data);
                    setLoading(false);
                })
                .catch(() => setLoading(false));
        }
    }, [status, router]);

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            draft: 'default',
            sent: 'blue',
            approved: 'green',
            rejected: 'red',
            converted: 'purple',
        };
        return colors[status] || 'default';
    };

    const columns = [
        {
            title: 'Quote #',
            dataIndex: 'quoteNumber',
            key: 'quoteNumber'
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            render: (amt: any) => `$${Number(amt).toFixed(2)}`
        },
        {
            title: 'Date',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => new Date(date).toLocaleDateString()
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: Quote) => (
                <Button type="link" onClick={() => router.push(`/client/quotes/${record.id}`)}>
                    View Details
                </Button>
            ),
        },
    ];

    if (status === 'loading') {
        return <div className="p-6">Loading...</div>;
    }

    return (
        <div className="p-6">
            <Card>
                <h1 className="text-2xl font-bold mb-4">My Quotes</h1>
                <p className="mb-4 text-gray-600">
                    View all your quotes, download PDFs, and approve or reject quotes.
                </p>
                <Table
                    dataSource={quotes}
                    columns={columns}
                    rowKey="id"
                    loading={loading}
                    locale={{ emptyText: 'No quotes found' }}
                />
            </Card>
        </div>
    );
}
