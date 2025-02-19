'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

interface CategoryListProps {
  categories: string[];
}

export function CategoryList({ categories }: CategoryListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category');

  const handleCategoryClick = (category: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (category) {
      params.set('category', category);
    } else {
      params.delete('category');
    }
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="w-64 p-4 bg-white rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">分类</h2>
      <div className="space-y-2">
        <button
          onClick={() => handleCategoryClick(null)}
          className={cn(
            'w-full text-left px-3 py-2 rounded-md transition-colors',
            !currentCategory
              ? 'bg-blue-100 text-blue-700'
              : 'hover:bg-gray-100'
          )}
        >
          全部
        </button>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryClick(category)}
            className={cn(
              'w-full text-left px-3 py-2 rounded-md transition-colors',
              currentCategory === category
                ? 'bg-blue-100 text-blue-700'
                : 'hover:bg-gray-100'
            )}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}