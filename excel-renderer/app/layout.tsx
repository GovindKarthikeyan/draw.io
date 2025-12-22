import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Excel File Renderer",
  description: "Upload and view Excel files with pixel-perfect formatting",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
