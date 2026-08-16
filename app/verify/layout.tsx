import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "签名验证工具",
  description: "输入消息与签名，验证签名者身份",
};

export default function VerifyLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
