"use client";

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Descriptions, Tag, Button, Card, Space, message } from 'antd';

interface Quote {
    id: string;
    quoteNumber: string;
    status: string;
    amount: any;
    description?: string;
    createdAt: string;
    expiresAt?: string;
}

export default function ClientQuoteDetailPage({ params }: { params: { id: string } }) {
    const { data: session, status: sessionStatus } = useSession();
    const router = useRouter();
    const [quote, setQuote] = useState<Quote | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (sessionStatus === 'unauthenticated') {
            router.push('/client/login');
            return;
        }

        if (sessionStatus === 'authenticated') {
            fetch(`/api/client/quotes/${params.id}`)
                .then((res) => {
                    if (!res.ok) {
                        message.error('Quote not found or access denied');
                        router.push('/client/quotes');
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
                    message.error('Failed to load quote');
                    setLoading(false);
                    router.push('/client/quotes');
                });
        }
    }, [sessionStatus, params.id, router]);

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

    const handleDownloadPDF = () => {
        window.open(`/api/quotes/${params.id}/pdf`, '_blank');
    };

    if (sessionStatus === 'loading' || loading) {
        return <div className="p-6">Loading quote...</div>;
    }

    if (!quote) {
        return <div className="p-6">Quote not found.</div>;
    }

    const canApprove = quote.status === 'sent';

    return (
        <div className="p-6">
            <Card>
                <h1 className="text-2xl font-bold mb-4">Quote #{quote.quoteNumber}</h1>

                <Descriptions bordered column={1} className="mb-6">
                    <Descriptions.Item label="Status">
                        <Tag color={getStatusColor(quote.status)}>
                            {quote.status.toUpperCase()}
                        </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Amount">
                        <span className="text-xl font-bold">${Number(quote.amount).toFixed(2)}</span>
                    </Descriptions.Item>
                    <Descriptions.Item label="Date">
                        {new Date(quote.createdAt).toLocaleDateString()}
                    </Descriptions.Item>
                    {quote.expiresAt && (
                        <Descriptions.Item label="Valid Until">
                            {new Date(quote.expiresAt).toLocaleDateString()}
                        </Descriptions.Item>
                    )}
                    <Descriptions.Item label="Description">
                        {quote.description || 'No description provided'}
                    </Descriptions.Item>
                </Descriptions>

                <Space>
                    <Button
                        type="primary"
                        onClick={handleDownloadPDF}
                        icon={<span>📄</span>}
                    >
                        Download PDF
                    </Button>

                    {canApprove && (
                        <>
                            <Button
                                type="primary"
                                style={{ backgroundColor: '#52c41a' }}
                                onClick={() => router.push(`/client/quotes/${params.id}/approve`)}
                            >
                                ✓ Approve Quote
                            </Button>
                            <Button
                                danger
                                onClick={() => router.push(`/client/quotes/${params.id}/reject`)}
                            >
                                ✗ Reject Quote
                            </Button>
                        </>
                    )}

                    <Button onClick={() => router.push('/client/quotes')}>
                        Back to Quotes
                    </Button>
                </Space>
            </Card>
        </div>
    );
}
