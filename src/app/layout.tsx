import "./globals.css";
import { metadata } from "./config";
// 修正导入路径，使用相对路径
import ClientLayout from "../components/ClientLayout";

export { metadata };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ClientLayout>{children}</ClientLayout>;
}
