"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Descriptions, Tag, Button } from 'antd';

interface Client {
    id: string;
    email: string;
    name: string;
}

interface Quote {
    id: string;
    quoteNumber: string;
    clientId: string;
    status: string;
    amount: any;
    description?: string;
    createdAt: string;
    client?: Client;
}

export default function QuoteShowPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [quote, setQuote] = useState<Quote | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/quotes/${params.id}`)
            .then((res) => {
                if (!res.ok) {
                    router.push('/admin/quotes');
                    return null;
                }
                return res.json();
            })
            .then((data) => {
                if (data) {
                    setQuote(data);
                }
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
                router.push('/admin/quotes');
            });
    }, [params.id, router]);

    if (loading) {
        return <div className="p-6">Loading quote...</div>;
    }

    if (!quote) {
        return <div className="p-6">Quote not found.</div>;
    }

    return (
        <div className="p-6 max-w-3xl">
            <h1 className="text-2xl font-bold mb-4">Quote #{quote.quoteNumber}</h1>
            <Descriptions bordered column={1}>
                <Descriptions.Item label="Client">{quote.client?.email}</Descriptions.Item>
                <Descriptions.Item label="Status"><Tag>{quote.status}</Tag></Descriptions.Item>
                <Descriptions.Item label="Amount">${quote.amount.toString()}</Descriptions.Item>
                <Descriptions.Item label="Created">{new Date(quote.createdAt).toLocaleString()}</Descriptions.Item>
                <Descriptions.Item label="Description">{quote.description}</Descriptions.Item>
            </Descriptions>
            <div className="mt-4">
                <Button
                    type="primary"
                    className="mr-2"
                    onClick={() => window.open(`/api/quotes/${quote.id}/pdf`, '_blank')}
                >
                    📄 Download PDF
                </Button>
                <Button className="mr-2" onClick={() => router.push(`/admin/quotes/edit/${quote.id}`)}>Edit</Button>
                <Button onClick={() => router.push('/admin/quotes')}>Back to List</Button>
            </div>
        </div>
    );
}
