"use client";

import React, { useEffect, useState } from 'react';
import { Form, Input, InputNumber, Button, Select } from 'antd';
import { useRouter } from 'next/navigation';

interface Client {
    id: string;
    email: string;
}

export default function CreateQuotePage() {
    const router = useRouter();
    const [clients, setClients] = useState<Client[]>([]);

    // Ensure admin access on client side (fallback)
    useEffect(() => {
        // Could add auth check via API if needed
        fetch('/api/clients')
            .then((res) => res.json())
            .then(setClients)
            .catch(() => {
                router.push('/login');
            });
    }, [router]);

    const onFinish = async (values: any) => {
        await fetch('/api/quotes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(values),
        });
        router.push('/admin/quotes');
    };

    return (
        <div className="p-6 max-w-2xl">
            <h1 className="text-2xl font-bold mb-4">Create New Quote</h1>
            <Form layout="vertical" onFinish={onFinish}>
                <Form.Item name="quoteNumber" label="Quote Number" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="clientId" label="Client" rules={[{ required: true }]}>
                    <Select placeholder="Select a client">
                        {clients.map((c) => (
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
                    <Button type="primary" htmlType="submit">Create Quote</Button>
                </Form.Item>
            </Form>
        </div>
    );
}
