"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// 定义文档类型接口
interface Document {
  id: string;
  likes?: number;
  [key: string]: any;  // 允许其他属性
}

export default function DocumentsPage() {
  const { data: session } = useSession();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const router = useRouter();

  const categories = [
    { id: "all", name: "全部" },
    { id: "frontend", name: "前端" },
    { id: "backend", name: "后端" },
    { id: "mobile", name: "移动开发" },
    { id: "ai", name: "人工智能" },
  ];

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch("/api/documents");
        if (!response.ok) {
          throw new Error("获取文档列表失败");
        }
        const data = await response.json();
        const documentsList = Array.isArray(data.documents) ? data.documents : (Array.isArray(data) ? data : []);
        setDocuments(documentsList.filter((doc: Document) => 
          (selectedCategory === "all" || doc.category === selectedCategory) &&
          (selectedTags.length === 0 || (doc.tags && doc.tags.split(",").some((tag: string) => selectedTags.includes(tag.trim()))))
        ));
      } catch (error) {
        console.error("获取文档列表失败:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user) {
      fetchDocuments();
    }
  }, [session, selectedCategory, selectedTags]);

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这篇文档吗？此操作不可恢复。")) {
      return;
    }

    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("删除文档失败");
      }

      setDocuments(documents.filter((doc: any) => doc.id !== id));
    } catch (error) {
      console.error("删除文档失败:", error);
      alert("删除文档失败，请稍后重试");
    }
  };

  const handleTagClick = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleLike = async (id: string) => {
    try {
      const response = await fetch(`/api/documents/${id}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("操作失败");
      }

      const updatedDoc = await response.json();
      setDocuments((prevDocs: Document[]) => 
        prevDocs.map(doc => 
          doc.id === id ? updatedDoc : doc
        )
      );
    } catch (error) {
      console.error("点赞操作失败:", error);
      alert("操作失败，请稍后重试");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">我的文档</h1>
          <Link
            href="/documents/new"
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-2.5 rounded-lg transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
          >
            写文章
          </Link>
        </div>
        </div>

      <div className="flex gap-8">
        <aside className="w-48 flex-shrink-0">
          <nav className="space-y-2 sticky top-24 backdrop-blur-xl bg-white/30 p-4 rounded-xl shadow-lg">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`w-full text-left px-4 py-2 rounded-lg transition-all duration-300 ${selectedCategory === category.id ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md' : 'hover:bg-white/50 text-gray-600 hover:text-gray-900'}`}
              >
                {category.name}
              </button>
            ))}
          </nav>
        </aside>

        <div className="flex-1">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc: any) => (
              <div
                key={doc.id}
                className="backdrop-blur-xl bg-white/40 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/50"
              >
                <h2 className="text-xl font-semibold mb-3 hover:bg-clip-text hover:text-transparent hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 transition-all duration-300">
                  <Link href={`/documents/${doc.id}`}>{doc.title}</Link>
                </h2>
                <p className="text-gray-600 mb-4 line-clamp-2 text-sm">{doc.content}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {doc.tags.split(",").map((tag: string) => tag.trim()).filter(Boolean).map((tag: string) => (
                    <button
                      key={tag}
                      onClick={() => handleTagClick(tag)}
                      className={`px-3 py-1.5 text-xs rounded-full transition-all duration-300 ${selectedTags.includes(tag) ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md" : "bg-white/50 text-gray-600 hover:bg-white/70 backdrop-blur-sm"}`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <div className="flex items-center gap-4">
                    <span>更新于 {new Date(doc.updatedAt).toLocaleDateString()}</span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleLike(doc.id)}
                        className={`flex items-center gap-1.5 transition-all duration-300 ${doc.isLiked ? "text-purple-600" : "text-gray-400 hover:text-blue-600"}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span>{doc.likes || 0}</span>
                      </button>
                      <span className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>{doc.views || 0}</span>
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/documents/${doc.id}?edit=true`}
                      className="text-green-500 hover:text-green-600"
                    >
                      编辑
                    </Link>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {documents.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p>还没有创建任何文档</p>
              <Link
                href="/documents/new"
                className="text-blue-500 hover:text-blue-600 mt-2 inline-block"
              >
                立即创建
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}