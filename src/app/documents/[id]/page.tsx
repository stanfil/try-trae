"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import Link from "next/link";

export default function DocumentPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [document, setDocument] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [isEditing, setIsEditing] = useState(searchParams.get("edit") === "true");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("frontend");
  const [tags, setTags] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { id: "frontend", name: "前端" },
    { id: "backend", name: "后端" },
    { id: "mobile", name: "移动开发" },
    { id: "ai", name: "人工智能" },
  ];

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const response = await fetch(`/api/documents/${params.id}`);
        if (!response.ok) {
          throw new Error(response.status === 404 ? "文档不存在" : "获取文档失败");
        }
        const data = await response.json();
        setDocument(data);
        setTitle(data.title);
        setContent(data.content);
        setCategory(data.category || "frontend");
        setTags(data.tags || "");
      } catch (error) {
        console.error("获取文档详情失败:", error);
        setError(error instanceof Error ? error.message : "获取文档失败");
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user && params.id) {
      fetchDocument();
    }
  }, [session, params.id]);

  // 单独的useEffect用于更新阅读量
  useEffect(() => {
    const updateViews = async () => {
      if (document?.id) {
        try {
          const response = await fetch(`/api/documents/${params.id}/view`, { method: "POST" });
          if (response.ok) {
            const updatedDoc = await response.json();
            setDocument(updatedDoc);
          }
        } catch (error) {
          console.error("更新阅读量失败:", error);
        }
      }
    };

    updateViews();
  }, [params.id, document?.id]);

  const handleDelete = async () => {
    if (!confirm("确定要删除这篇文档吗？此操作不可恢复。")) {
      return;
    }

    try {
      const response = await fetch(`/api/documents/${params.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("删除文档失败");
      }

      router.push("/documents");
    } catch (error) {
      console.error("删除文档失败:", error);
      alert("删除文档失败，请稍后重试");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) return;

    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/documents/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
          category,
          tags,
        }),
      });

      if (!response.ok) {
        throw new Error("更新文档失败");
      }

      const updatedDoc = await response.json();
      setDocument(updatedDoc);
      setIsEditing(false);
      router.replace(`/documents/${params.id}`);
    } catch (error) {
      console.error("更新文档失败:", error);
      alert("更新文档失败，请重试");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleEditMode = () => {
    if (isEditing) {
      setTitle(document.title);
      setContent(document.content);
      setCategory(document.category || "frontend");
      setTags(document.tags || "");
      router.replace(`/documents/${params.id}`);
    } else {
      router.replace(`/documents/${params.id}?edit=true`);
    }
    setIsEditing(!isEditing);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="backdrop-blur-xl bg-white/40 rounded-xl p-8 shadow-lg border border-white/50">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="backdrop-blur-xl bg-white/40 rounded-xl p-8 shadow-lg border border-white/50">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">出错了</h2>
              <p className="text-gray-500">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!document) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="backdrop-blur-xl bg-white/40 rounded-xl p-8 shadow-lg border border-white/50">
          {isEditing ? (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  标题
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  分类
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  required
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                  标签 (用逗号分隔)
                </label>
                <input
                  type="text"
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="例如: JavaScript, React, Web"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                  内容 (支持 Markdown)
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full h-96 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 font-mono"
                  required
                />
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={toggleEditMode}
                  className="px-5 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-300 font-medium"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-all duration-300 shadow-sm hover:shadow-md disabled:bg-blue-300 font-medium"
                >
                  {isSubmitting ? "保存中..." : "保存"}
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{document.title}</h1>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={async () => {
                          try {
                            const response = await fetch(`/api/documents/${params.id}/like`, { 
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json"
                              }
                            });
                            if (!response.ok) throw new Error("操作失败");
                            const updatedDoc = await response.json();
                            setDocument(updatedDoc);
                          } catch (error) {
                            console.error("点赞操作失败:", error);
                            alert("操作失败，请稍后重试");
                          }
                        }}
                        className={`flex items-center gap-1 ${document.isLiked ? "text-blue-600" : "text-gray-400 hover:text-blue-600"}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span>{document.likes || 0}</span>
                      </button>
                      <span className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>{document.views || 0}</span>
                      </span>
                    </div>
                    <span>分类: {categories.find(cat => cat.id === document.category)?.name || "未分类"}</span>
                    {document.tags && (
                      <span>标签: {document.tags}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={toggleEditMode}
                    className="px-4 py-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                  >
                    编辑
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    删除
                  </button>
                </div>
              </div>
              <div className="text-sm text-gray-500 mb-8">
                更新于 {new Date(document.updatedAt).toLocaleString()}
              </div>
              <div className="prose max-w-none">
                <ReactMarkdown>{document.content}</ReactMarkdown>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}