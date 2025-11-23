"use client";

import { useState, useEffect } from "react";
import { Card, Breadcrumb, List, Spin, Button, message } from "antd";
import { FolderOutlined, FileOutlined, ArrowLeftOutlined, CodeOutlined } from "@ant-design/icons";

interface RepositoryBrowserProps {
    projectId: string;
}

interface FileItem {
    blobId?: string;
    mode?: string;
    absolutePath: string;
    relativePath: string;
}

interface FolderItem {
    treeId?: string;
    absolutePath: string;
    relativePath: string;
}

export default function RepositoryBrowser({ projectId }: RepositoryBrowserProps) {
    const [currentPath, setCurrentPath] = useState("/");
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState<(FileItem | FolderItem)[]>([]);
    const [fileContent, setFileContent] = useState<string | null>(null);
    const [viewingFile, setViewingFile] = useState(false);

    const fetchPath = async (path: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/projects/${projectId}/repo?path=${encodeURIComponent(path)}&type=tree`);
            if (!res.ok) throw new Error("Failed to fetch repository data");
            const data = await res.json();

            // Combine files and folders
            const combined = [
                ...(data.subFolders || []).map((f: any) => ({ ...f, type: 'folder' })),
                ...(data.files || []).map((f: any) => ({ ...f, type: 'file' }))
            ];
            setItems(combined);
            setCurrentPath(path);
            setViewingFile(false);
            setFileContent(null);
        } catch (error) {
            message.error("Could not load repository");
        } finally {
            setLoading(false);
        }
    };

    const fetchFile = async (path: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/projects/${projectId}/repo?path=${encodeURIComponent(path)}&type=blob`);
            if (!res.ok) throw new Error("Failed to fetch file");
            const data = await res.json();
            setFileContent(data.content);
            setCurrentPath(path);
            setViewingFile(true);
        } catch (error) {
            message.error("Could not load file");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPath("/");
    }, [projectId]);

    const handleNavigate = (item: any) => {
        if (item.type === 'folder') {
            fetchPath(item.absolutePath);
        } else {
            fetchFile(item.absolutePath);
        }
    };

    const handleBreadcrumbClick = (path: string) => {
        // Simple logic: just fetch the path. 
        // If it was a file, we might need to go up to parent folder.
        // For now, assume breadcrumbs are always folders except maybe the last one.
        fetchPath(path || "/");
    };

    const goUp = () => {
        if (currentPath === "/") return;
        const parts = currentPath.split("/").filter(Boolean);
        parts.pop();
        const parentPath = parts.length > 0 ? "/" + parts.join("/") : "/";
        fetchPath(parentPath);
    };

    // Generate breadcrumbs
    const pathParts = currentPath.split("/").filter(Boolean);
    const breadcrumbItems = [
        { title: <a onClick={() => fetchPath("/")}>root</a> },
        ...pathParts.map((part, index) => {
            const path = "/" + pathParts.slice(0, index + 1).join("/");
            return {
                title: index === pathParts.length - 1 && viewingFile ? part : <a onClick={() => fetchPath(path)}>{part}</a>
            };
        })
    ];

    return (
        <Card
            title={
                <div className="flex items-center gap-4">
                    {currentPath !== "/" && (
                        <Button icon={<ArrowLeftOutlined />} onClick={goUp} size="small">
                            Up
                        </Button>
                    )}
                    <Breadcrumb items={breadcrumbItems} />
                </div>
            }
            className="shadow-sm"
        >
            {loading ? (
                <div className="text-center py-12">
                    <Spin size="large" />
                </div>
            ) : viewingFile ? (
                <div className="bg-gray-50 p-4 rounded-md overflow-auto max-h-[600px]">
                    <pre className="text-sm font-mono whitespace-pre-wrap">
                        {fileContent}
                    </pre>
                </div>
            ) : (
                <List
                    itemLayout="horizontal"
                    dataSource={items}
                    renderItem={(item: any) => (
                        <List.Item
                            className="cursor-pointer hover:bg-gray-50 transition-colors px-4 rounded"
                            onClick={() => handleNavigate(item)}
                        >
                            <List.Item.Meta
                                avatar={
                                    item.type === 'folder' ?
                                        <FolderOutlined className="text-blue-500 text-lg" /> :
                                        <FileOutlined className="text-gray-500 text-lg" />
                                }
                                title={<span className="font-medium">{item.relativePath}</span>}
                            />
                        </List.Item>
                    )}
                />
            )}
        </Card>
    );
}
