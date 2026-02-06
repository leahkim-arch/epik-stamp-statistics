import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stamp Performance Dashboard",
  description: "2026.01 Stamp Performance Analytics Dashboard",
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
