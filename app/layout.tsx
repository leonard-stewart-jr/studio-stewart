import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import "leaflet/dist/leaflet.css";
import ClientLayout from "../components/ClientLayout";

const inter = Inter({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-inter",
});

export const metadata: Metadata = {
    title: "Studio Stewart",
    description: "Architecture and Design Portfolio",
    icons: {
        icon: [
            { url: "/favicon.png" },
            { url: "/assets/logo-mark-only.svg", type: "image/svg+xml" },
        ],
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.variable}>
                <ClientLayout>{children}</ClientLayout>
            </body>
        </html>
    );
}
