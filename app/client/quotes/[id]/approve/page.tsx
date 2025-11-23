"use client";

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, Button, Result, Spin, message } from 'antd';

export default function ApproveQuotePage({ params }: { params: { id: string } }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [approved, setApproved] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/client/login');
        }
    }, [status, router]);

    const handleApprove = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/client/quotes/${params.id}/approve`, {
                method: 'POST',
            });
            if (response.ok) {
                setApproved(true);
                message.success('Quote approved successfully!');
            } else {
                const data = await response.json();
                message.error(data.error || 'Failed to approve quote');
                setLoading(false);
            }
        } catch (error) {
            message.error('An error occurred while approving the quote');
            setLoading(false);
        }
    };

    if (status === 'loading') {
        return <div className="p-6"><Spin size="large" /></div>;
    }

    if (approved) {
        return (
            <div className="p-6">
                <Result
                    status="success"
                    title="Quote Approved!"
                    subTitle="Your approval has been recorded. We'll begin work on your project shortly."
                    extra={[
                        <Button key="quotes" type="primary" onClick={() => router.push('/client/quotes')}>View All Quotes</Button>,
                        <Button key="dashboard" onClick={() => router.push('/client')}>Go to Dashboard</Button>,
                    ]}
                />
            </div>
        );
    }

    return (
        <div className="p-6">
            <Card>
                <h1 className="text-2xl font-bold mb-4">Approve Quote</h1>
                <p className="mb-6 text-gray-700">
                    By approving this quote, you agree to the proposed work and pricing. This will move the quote to the "Approved" status and we can begin work.
                </p>
                <div className="flex gap-4">
                    <Button type="primary" size="large" onClick={handleApprove} loading={loading}>
                        ✓ Yes, Approve This Quote
                    </Button>
                    <Button size="large" onClick={() => router.push(`/client/quotes/${params.id}`)} disabled={loading}>
                        Cancel
                    </Button>
                </div>
            </Card>
        </div>
    );
}
