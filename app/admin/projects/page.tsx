"use client";

import { List, useTable, EditButton, ShowButton, DeleteButton, DateField } from "@refinedev/antd";
import { Table, Space } from "antd";

export default function ProjectList() {
    const { tableProps } = useTable({
        syncWithLocation: true,
    });

    return (
        <List>
            <Table {...tableProps} rowKey="id">
                <Table.Column dataIndex="title" title="Title" />
                <Table.Column dataIndex="slug" title="Slug" />
                <Table.Column
                    dataIndex="featured"
                    title="Featured"
                    render={(value) => (value ? "Yes" : "No")}
                />
                <Table.Column
                    dataIndex="createdAt"
                    title="Created At"
                    render={(value: any) => <DateField value={value} />}
                />
                <Table.Column
                    title="Actions"
                    dataIndex="actions"
                    render={(_, record: any) => (
                        <Space>
                            <EditButton hideText size="small" recordItemId={record.id} />
                            <ShowButton hideText size="small" recordItemId={record.id} />
                            <DeleteButton hideText size="small" recordItemId={record.id} />
                        </Space>
                    )}
                />
            </Table>
        </List>
    );
}
