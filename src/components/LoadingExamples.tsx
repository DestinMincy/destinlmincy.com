import React, { Suspense } from "react";
import PageLoader from "./PageLoader";
import CardLoader from "./CardLoader";
import TableLoader from "./TableLoader";

/**
 * Loading Components Usage Examples
 * 
 * This file demonstrates how to use the loading components throughout the application.
 */

// Example 1: Using PageLoader for full page loading
export function PageLoadingExample() {
    return <PageLoader message="Loading your dashboard..." />;
}

// Example 2: Using CardLoader for card content
export function CardLoadingExample() {
    return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" }}>
            <CardLoader rows={4} />
            <CardLoader rows={3} title={false} />
            <CardLoader rows={5} />
        </div>
    );
}

// Example 3: Using TableLoader for data tables
export function TableLoadingExample() {
    return <TableLoader columns={5} rows={8} />;
}

// Example 4: Using with Suspense boundaries
async function DataComponent() {
    // Simulate async data fetching
    await new Promise(resolve => setTimeout(resolve, 2000));
    return <div>Loaded Data!</div>;
}

export function SuspenseExample() {
    return (
        <Suspense fallback={<PageLoader message="Loading data..." />}>
            <DataComponent />
        </Suspense>
    );
}

// Example 5: Conditional rendering based on loading state
export function ConditionalLoadingExample({ isLoading, data }: { isLoading: boolean; data?: any }) {
    if (isLoading) {
        return <CardLoader rows={3} />;
    }

    return <div>{data?.content || "No data"}</div>;
}
