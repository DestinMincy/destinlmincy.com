"use client";

import { Card, Typography, Row, Col } from "antd";
import { useGetIdentity } from "@refinedev/core";

const { Title, Paragraph } = Typography;

export default function AdminDashboard() {
    const { data: user } = useGetIdentity<{ name: string }>();

    return (
        <div style={{ padding: 24 }}>
            <Title level={2}>Welcome, {user?.name}</Title>
            <Paragraph>
                This is your admin dashboard. From here you can manage your portfolio projects.
            </Paragraph>

            <Row gutter={[16, 16]}>
                <Col span={8}>
                    <Card title="Projects" bordered={false}>
                        Manage your portfolio items.
                    </Card>
                </Col>
                <Col span={8}>
                    <Card title="Messages" bordered={false}>
                        View contact form submissions.
                    </Card>
                </Col>
                <Col span={8}>
                    <Card title="Settings" bordered={false}>
                        Configure site settings.
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
