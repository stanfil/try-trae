"use client";

import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import UserMenu from "./UserMenu";
import { geistSans, geistMono } from "@/app/config";
import Link from "next/link";
import { useState } from "react";

const queryClient = new QueryClient();

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <SessionProvider>
          <QueryClientProvider client={queryClient}>
            <header className="fixed top-0 left-0 right-0 backdrop-blur-xl bg-white/80 border-b border-gray-200/20 z-10 shadow-sm">
              <div className="mx-auto px-4 max-w-screen-xl">
                <div className="flex items-center justify-between h-16">
                  <div className="flex items-center gap-6">
                    <Link href="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300">掘金</Link>
                    <nav className="hidden md:flex space-x-6">
                      <Link href="/documents" className="text-gray-600 hover:text-blue-600 text-sm font-medium transition-all duration-300">文档</Link>
                      <Link href="/documents/new" className="text-gray-600 hover:text-blue-600 text-sm font-medium transition-all duration-300">写文章</Link>
                    </nav>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="搜索文章"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-64 px-4 py-2 border border-gray-200/50 rounded-full bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm backdrop-blur-sm transition-all duration-300 hover:border-gray-300/50"
                      />
                      <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </button>
                    </div>
                    <UserMenu />
                  </div>
                </div>
              </div>
            </header>
            <main className="mt-16 min-h-screen py-8">
              <div className="mx-auto px-4 max-w-screen-xl">
                {children}
              </div>
            </main>
          </QueryClientProvider>
        </SessionProvider>
      </body>
    </html>
  );
}