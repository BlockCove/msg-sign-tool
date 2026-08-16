import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "签名生成工具",
  description: "使用 MetaMask 对任意消息进行签名",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
