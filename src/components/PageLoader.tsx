import { Spin } from "antd";

interface PageLoaderProps {
    message?: string;
}

export default function PageLoader({ message = "Loading..." }: PageLoaderProps) {
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "60vh",
                gap: "16px"
            }}
        >
            <Spin size="large" />
            <p style={{ color: "#666", fontSize: "16px" }}>{message}</p>
        </div>
    );
}
