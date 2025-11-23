"use client";

import { Button, Result } from "antd";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
                    <Result
                        status="500"
                        title="500"
                        subTitle="Sorry, something went wrong."
                        extra={
                            <Button type="primary" onClick={() => reset()}>
                                Try again
                            </Button>
                        }
                    />
                </div>
            </body>
        </html>
    );
}
