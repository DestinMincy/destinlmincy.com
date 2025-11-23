"use client";

import { Steps, Card, Tag, Typography } from "antd";
import { CheckCircleOutlined, ClockCircleOutlined, LoadingOutlined, SyncOutlined } from "@ant-design/icons";

const { Title, Paragraph } = Typography;

interface Milestone {
    id: string;
    title: string;
    status: string; // pending, in_progress, completed, approved
    dueDate?: Date | string;
    deliverables?: any;
}

interface MilestoneTrackerProps {
    milestones: Milestone[];
}

export default function MilestoneTracker({ milestones }: MilestoneTrackerProps) {
    // Sort milestones by creation or due date if needed, but usually they come sorted

    const getStatusProps = (status: string) => {
        switch (status) {
            case "completed":
            case "approved":
                return { status: "finish" as const, icon: <CheckCircleOutlined /> };
            case "in_progress":
                return { status: "process" as const, icon: <LoadingOutlined /> };
            default:
                return { status: "wait" as const, icon: <ClockCircleOutlined /> };
        }
    };

    const items = milestones.map((m) => {
        const { status, icon } = getStatusProps(m.status);
        return {
            title: m.title,
            status,
            icon,
            description: (
                <div className="mt-2">
                    <div className="mb-1">
                        <Tag color={
                            m.status === 'approved' ? 'success' :
                                m.status === 'completed' ? 'blue' :
                                    m.status === 'in_progress' ? 'processing' : 'default'
                        }>
                            {m.status.replace('_', ' ').toUpperCase()}
                        </Tag>
                    </div>
                    {m.dueDate && (
                        <div className="text-xs text-gray-500">
                            Due: {new Date(m.dueDate).toLocaleDateString()}
                        </div>
                    )}
                </div>
            ),
        };
    });

    return (
        <Card title="Project Milestones" className="shadow-sm">
            <div className="py-4">
                <Steps
                    direction="vertical"
                    current={milestones.findIndex(m => m.status === 'in_progress') !== -1
                        ? milestones.findIndex(m => m.status === 'in_progress')
                        : milestones.filter(m => ['completed', 'approved'].includes(m.status)).length}
                    items={items}
                />
            </div>
        </Card>
    );
}
