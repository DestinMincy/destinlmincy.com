"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Form, Input, InputNumber, Button, Select, message } from 'antd';

interface Customer {
    id: string;
    email: string;
}

interface QuoteData {
    id: string;
    quoteNumber: string;
    customerId: string;
    status: string;
    amount: number;
    description?: string;
}

export default function EditQuotePage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [quote, setQuote] = useState<QuoteData | null>(null);
    const [customers, setCustomers] = useState<Customer[]>([]);

    // Load quote and customers on mount
    useEffect(() => {
        // Fetch quote details
        fetch(`/api/quotes/${params.id}`)
            .then((res) => res.json())
            .then(setQuote)
            .catch(() => {
                message.error('Failed to load quote');
                router.push('/admin/quotes');
            });
        // Fetch customers for select
        fetch('/api/customers')
            .then((res) => res.json())
            .then(setCustomers)
            .catch(() => message.error('Failed to load customers'));
    }, [params.id, router]);

    const onFinish = async (values: any) => {
        if (!quote) return;
        const response = await fetch(`/api/quotes/${params.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(values),
        });
        if (response.ok) {
            message.success('Quote updated');
            router.push(`/admin/quotes/show/${params.id}`);
        } else {
            const err = await response.json();
            message.error(err.error || 'Update failed');
        }
    };

    if (!quote) {
        return <div className="p-6">Loading quote...</div>;
    }

    return (
        <div className="p-6 max-w-2xl">
            <h1 className="text-2xl font-bold mb-4">Edit Quote #{quote.quoteNumber}</h1>
            <Form layout="vertical" onFinish={onFinish} initialValues={quote}>
                <Form.Item name="quoteNumber" label="Quote Number" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="customerId" label="Customer" rules={[{ required: true }]}>
                    <Select placeholder="Select a customer">
                        {customers.map((c) => (
                            <Select.Option key={c.id} value={c.id}>
                                {c.email}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item name="status" label="Status" rules={[{ required: true }]}>
                    <Select>
                        <Select.Option value="draft">Draft</Select.Option>
                        <Select.Option value="sent">Sent</Select.Option>
                        <Select.Option value="approved">Approved</Select.Option>
                        <Select.Option value="rejected">Rejected</Select.Option>
                        <Select.Option value="converted">Converted</Select.Option>
                    </Select>
                </Form.Item>
                <Form.Item name="amount" label="Amount" rules={[{ required: true }]}>
                    <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name="description" label="Description">
                    <Input.TextArea rows={4} />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit">Save Changes</Button>
                </Form.Item>
            </Form>
        </div>
    );
}
