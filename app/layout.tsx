import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EPIK STAMP",
  description: "2026.01 EPIK Stamp Performance Statistics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
