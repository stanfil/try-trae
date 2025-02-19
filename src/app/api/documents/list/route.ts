import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'recommended';
    const category = searchParams.get('category');

    const documents = await prisma.document.findMany({
      where: {
        ...(category ? { category } : {}),
      },
      orderBy: {
        ...(type === 'recommended' ? { likes: 'desc' } : { createdAt: 'desc' }),
      },
      include: {
        author: {
          select: {
            name: true,
            image: true,
          },
        },
      },
      take: 20,
    });

    // 获取所有分类
    const categories = await prisma.document.findMany({
      select: {
        category: true,
      },
      distinct: ['category'],
      where: {
        category: {
          not: '',
        },
      },
    });

    return NextResponse.json({
      documents,
      categories: categories.map(c => c.category).filter(Boolean),
    });


  } catch (error) {
    console.error("获取文章列表失败:", error);
    return new NextResponse("获取文章列表失败", { status: 500 });
  }
}