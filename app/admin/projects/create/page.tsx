"use client";

import { Create, useForm } from "@refinedev/antd";
import { Form, Input, Checkbox, Select } from "antd";

export default function ProjectCreate() {
    const { formProps, saveButtonProps } = useForm();

    return (
        <Create saveButtonProps={saveButtonProps}>
            <Form {...formProps} layout="vertical">
                <Form.Item
                    label="Title"
                    name="title"
                    rules={[{ required: true }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Slug"
                    name="slug"
                    rules={[{ required: true }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Description"
                    name="description"
                    rules={[{ required: true }]}
                >
                    <Input.TextArea rows={5} />
                </Form.Item>
                <Form.Item
                    label="Live URL"
                    name="liveUrl"
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="GitHub URL"
                    name="githubUrl"
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="License Type"
                    name="licenseType"
                    initialValue="PROPRIETARY"
                >
                    <Select
                        options={[
                            { value: "MIT", label: "MIT" },
                            { value: "APACHE", label: "Apache" },
                            { value: "GPL", label: "GPL" },
                            { value: "PROPRIETARY", label: "Proprietary" },
                        ]}
                    />
                </Form.Item>
                <Form.Item
                    label="Featured"
                    name="featured"
                    valuePropName="checked"
                >
                    <Checkbox>Featured Project</Checkbox>
                </Form.Item>
            </Form>
        </Create>
    );
}
