"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Table, Button, Space, Tag } from 'antd';
import { Decimal } from '@prisma/client/runtime/library';

interface Customer {
    id: string;
    email: string;
    name: string;
}

interface Quote {
    id: string;
    quoteNumber: string;
    customerId: string;
    status: string;
    amount: Decimal;
    description?: string;
    createdAt: Date;
    customer?: Customer;
}

export default function QuotesListPage() {
    const router = useRouter();
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/quotes')
            .then((res) => res.json())
            .then((data) => {
                setQuotes(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const columns = [
        { title: 'Quote #', dataIndex: 'quoteNumber', key: 'quoteNumber' },
        { title: 'Customer', dataIndex: ['customer', 'email'], key: 'customer' },
        { title: 'Status', dataIndex: 'status', key: 'status', render: (status: string) => <Tag>{status}</Tag> },
        { title: 'Amount', dataIndex: 'amount', key: 'amount', render: (amt: any) => `$${amt}` },
        { title: 'Created', dataIndex: 'createdAt', key: 'createdAt', render: (date: string) => new Date(date).toLocaleDateString() },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: Quote) => (
                <Space>
                    <Button type="link" onClick={() => router.push(`/admin/quotes/show/${record.id}`)}>View</Button>
                    <Button type="link" onClick={() => router.push(`/admin/quotes/edit/${record.id}`)}>Edit</Button>
                </Space>
            ),
        },
    ];

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Quotes Management</h1>
            <Button type="primary" className="mb-4" onClick={() => router.push('/admin/quotes/create')}>
                Create New Quote
            </Button>
            <Table dataSource={quotes} columns={columns} rowKey="id" loading={loading} />
        </div>
    );
}
