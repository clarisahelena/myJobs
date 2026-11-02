import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DevJob — Programmer Job Board",
  description:
    "Find programming jobs filtered by seniority, experience, stack, and country.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
