import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "printtie",
  description: "printtie demo (Next.js 15)"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="min-h-dvh bg-white text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
