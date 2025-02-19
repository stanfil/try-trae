'use client';

import { useState } from 'react';
import { Document } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { EyeIcon, HeartIcon, TagIcon } from 'lucide-react';

type DocumentWithAuthor = Document & {
  author: {
    name: string;
    image: string | null;
  };
};

type DocumentsResponse = {
  documents: DocumentWithAuthor[];
};

export default function Home() {
  const [tab, setTab] = useState('recommended');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: "all", name: "全部" },
    { id: "frontend", name: "前端" },
    { id: "backend", name: "后端" },
    { id: "mobile", name: "移动开发" },
    { id: "ai", name: "人工智能" },
  ];

  const { data: documents, isLoading } = useQuery<DocumentsResponse>({
    queryKey: ['documents', tab, selectedCategory],
    queryFn: async () => {
      const response = await fetch(`/api/documents/list?type=${tab}&category=${selectedCategory}`);
      if (!response.ok) {
        throw new Error('获取文章列表失败');
      }
      return response.json();
    },
  });

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="flex gap-8">
        <aside className="w-48 flex-shrink-0">
          <nav className="space-y-2">
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
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="mb-8">
              <TabsTrigger value="recommended">推荐</TabsTrigger>
              <TabsTrigger value="latest">最新</TabsTrigger>
            </TabsList>

            <TabsContent value="recommended" className="space-y-6">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((n) => (
                    <Card key={n} className="overflow-hidden backdrop-blur-xl bg-white/40 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/50">
                      <CardContent className="p-6">
                        <div className="animate-pulse space-y-4">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                          <div className="flex items-center gap-4">
                            <div className="h-6 w-6 rounded-full bg-gray-200"></div>
                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : documents?.documents?.map((doc) => (
                <ArticleCard key={doc.id} document={doc} />
              ))}
            </TabsContent>

            <TabsContent value="latest" className="space-y-6">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((n) => (
                    <Card key={n} className="overflow-hidden backdrop-blur-xl bg-white/40 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/50">
                      <CardContent className="p-6">
                        <div className="animate-pulse space-y-4">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                          <div className="flex items-center gap-4">
                            <div className="h-6 w-6 rounded-full bg-gray-200"></div>
                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : documents?.documents?.map((doc) => (
                <ArticleCard key={doc.id} document={doc} />
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  );
}

function ArticleCard({ document }: { document: DocumentWithAuthor }) {
  return (
    <Card className="overflow-hidden backdrop-blur-xl bg-white/40 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/50">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2 hover:bg-clip-text hover:text-transparent hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 transition-all duration-300 cursor-pointer">
              {document.title}
            </CardTitle>
            <p className="text-gray-600 line-clamp-1 mb-4">
              {document.content}
            </p>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={document.author.image || ''} />
                  <AvatarFallback>{document.author.name?.[0]}</AvatarFallback>
                </Avatar>
                <span className="text-sm text-gray-600">{document.author.name}</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <EyeIcon className="h-4 w-4" />
                  {document.views}
                </span>
                <span className="flex items-center gap-1">
                  <HeartIcon className="h-4 w-4" />
                  {document.likes}
                </span>
              </div>
              {document.tags && (
                <div className="flex items-center gap-2">
                  <TagIcon className="h-4 w-4 text-gray-500" />
                  {document.tags.split(',').map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
