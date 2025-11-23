"use client";

import { Show, TextField, DateField, MarkdownField } from "@refinedev/antd";
import { Typography } from "antd";
import { useShow } from "@refinedev/core";

const { Title } = Typography;

export default function ProjectShow() {
    const { queryResult } = useShow();
    const { data, isLoading } = queryResult;

    const record = data?.data;

    return (
        <Show isLoading={isLoading}>
            <Title level={5}>Title</Title>
            <TextField value={record?.title} />

            <Title level={5}>Slug</Title>
            <TextField value={record?.slug} />

            <Title level={5}>Description</Title>
            <MarkdownField value={record?.description} />

            <Title level={5}>Live URL</Title>
            <TextField value={record?.liveUrl} />

            <Title level={5}>GitHub URL</Title>
            <TextField value={record?.githubUrl} />

            <Title level={5}>License Type</Title>
            <TextField value={record?.licenseType} />

            <Title level={5}>Featured</Title>
            <TextField value={record?.featured ? "Yes" : "No"} />

            <Title level={5}>Created At</Title>
            <DateField value={record?.createdAt} />
        </Show>
    );
}
