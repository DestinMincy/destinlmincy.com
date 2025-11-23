"use client";

import React from 'react';
import { Button, Typography, Space, Card, Divider, Row, Col } from 'antd';

const { Title, Paragraph, Text } = Typography;

export default function DesignSystemPage() {
    return (
        <div style={{ padding: '50px' }}>
            <Title level={1}>Design System</Title>
            <Paragraph>
                This page showcases the design system components, colors, and typography.
            </Paragraph>

            <Divider orientation="left">Colors</Divider>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Row gutter={[16, 16]}>
                    <Col span={6}>
                        <Card title="Primary (#2776EA)" bordered={false} style={{ backgroundColor: '#2776EA', color: 'white' }}>
                            Primary Color
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card title="Secondary (#FFD700)" bordered={false} style={{ backgroundColor: '#FFD700', color: 'black' }}>
                            Secondary Color
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card title="Accent (#C0C0C0)" bordered={false} style={{ backgroundColor: '#C0C0C0', color: 'black' }}>
                            Accent Color
                        </Card>
                    </Col>
                </Row>
            </Space>

            <Divider orientation="left">Typography</Divider>
            <Space direction="vertical">
                <Title level={1}>h1. Heading (Montserrat)</Title>
                <Title level={2}>h2. Heading</Title>
                <Title level={3}>h3. Heading</Title>
                <Title level={4}>h4. Heading</Title>
                <Title level={5}>h5. Heading</Title>
                <Paragraph>
                    This is a paragraph. It uses the default text color and font family.
                </Paragraph>
                <Text type="secondary">Secondary Text</Text>
                <Text type="success">Success Text</Text>
                <Text type="warning">Warning Text</Text>
                <Text type="danger">Danger Text</Text>
            </Space>

            <Divider orientation="left">Buttons</Divider>
            <Space wrap>
                <Button type="primary">Primary Button</Button>
                <Button>Default Button</Button>
                <Button type="dashed">Dashed Button</Button>
                <Button type="text">Text Button</Button>
                <Button type="link">Link Button</Button>
                <Button type="primary" danger>Danger Button</Button>
            </Space>
        </div>
    );
}
