import { Table } from "antd";

interface TableLoaderProps {
    columns?: number;
    rows?: number;
}

export default function TableLoader({ columns = 4, rows = 5 }: TableLoaderProps) {
    const loadingColumns = Array.from({ length: columns }, (_, i) => ({
        title: `Column ${i + 1}`,
        dataIndex: `col${i}`,
        key: `col${i}`,
    }));

    const loadingData = Array.from({ length: rows }, (_, i) => ({
        key: i,
    }));

    return (
        <Table
            columns={loadingColumns}
            dataSource={loadingData}
            loading={true}
            pagination={false}
        />
    );
}
