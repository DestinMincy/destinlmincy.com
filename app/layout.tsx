import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";
import { ConfigProvider } from "antd";
import NextAuthSessionProvider from "@/providers/session-provider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat" });

export const metadata: Metadata = {
    title: "Destin L. Mincy - Portfolio & Client Portal",
    description: "AI-Powered Portfolio and Client Management Platform",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={`${inter.className} ${montserrat.variable}`}>
                <NextAuthSessionProvider>
                    <ConfigProvider
                        theme={{
                            token: {
                                colorPrimary: "#2776EA",
                                fontFamily: "Montserrat, sans-serif",
                            },
                        }}
                    >
                        <div className="flex flex-col min-h-screen">
                            <Navbar />
                            <main className="flex-1">{children}</main>
                            <Footer />
                        </div>
                    </ConfigProvider>
                </NextAuthSessionProvider>
            </body>
        </html>
    );
}
