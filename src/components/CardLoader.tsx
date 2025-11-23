import { Card, Skeleton } from "antd";

interface CardLoaderProps {
    rows?: number;
    title?: boolean;
}

export default function CardLoader({ rows = 3, title = true }: CardLoaderProps) {
    return (
        <Card>
            <Skeleton active title={title} paragraph={{ rows }} />
        </Card>
    );
}
