"use client";

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, Button, Result, Spin, message, Input } from 'antd';

const { TextArea } = Input;

export default function RejectQuotePage({ params }: { params: { id: string } }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [rejected, setRejected] = useState(false);
    const [reason, setReason] = useState('');

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/client/login');
        }
    }, [status, router]);

    const handleReject = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/client/quotes/${params.id}/reject`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason }),
            });

            if (response.ok) {
                setRejected(true);
                message.info('Quote rejected');
            } else {
                const data = await response.json();
                message.error(data.error || 'Failed to reject quote');
                setLoading(false);
            }
        } catch (error) {
            message.error('An error occurred while rejecting the quote');
            setLoading(false);
        }
    };

    if (status === 'loading') {
        return <div className="p-6"><Spin size="large" /></div>;
    }

    if (rejected) {
        return (
            <div className="p-6">
                <Result
                    status="info"
                    title="Quote Rejected"
                    subTitle="We've recorded your decision. We'll reach out to discuss alternatives if needed."
                    extra={[
                        <Button type="primary" key="quotes" onClick={() => router.push('/client/quotes')}>
                            View All Quotes
                        </Button>,
                        <Button key="dashboard" onClick={() => router.push('/client')}>
                            Go to Dashboard
                        </Button>,
                    ]}
                />
            </div>
        );
    }

    return (
        <div className="p-6">
            <Card>
                <h1 className="text-2xl font-bold mb-4">Reject Quote</h1>
                <p className="mb-4 text-gray-700">
                    Before rejecting this quote, please let us know why. This will help us provide better proposals in the future.
                </p>

                <div className="mb-6">
                    <label className="block mb-2 font-medium">Reason (Optional)</label>
                    <TextArea
                        rows={4}
                        placeholder="e.g., Price too high, timeline doesn't work, scope needs adjustment..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    />
                </div>

                <div className="flex gap-4">
                    <Button
                        danger
                        size="large"
                        onClick={handleReject}
                        loading={loading}
                    >
                        ✗ Yes, Reject This Quote
                    </Button>
                    <Button
                        size="large"
                        onClick={() => router.push(`/client/quotes/${params.id}`)}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                </div>
            </Card>
        </div>
    );
}
