import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AIDP ROI 시뮬레이터 | 위시켓",
  description: "AI 도입 ROI를 즉시 확인하세요. 위시켓 AIDP의 데이터 기반 ROI 시뮬레이터.",
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
