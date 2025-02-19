import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("未授权", { status: 401 });
    }

    const { title, content, category, tags } = await request.json();
    if (!title || !content) {
      return new NextResponse("标题和内容不能为空", { status: 400 });
    }

    const document = await prisma.document.create({
      data: {
        title,
        content,
        category,
        tags,
        authorId: (session.user as any).id,
      },
    });

    return NextResponse.json(document);
  } catch (error) {
    console.error("创建文档失败:", error);
    return new NextResponse("创建文档失败", { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("未授权", { status: 401 });
    }

    const documents = await prisma.document.findMany({
      where: {
        authorId: (session.user as any).id,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error("获取文档列表失败:", error);
    return new NextResponse("获取文档列表失败", { status: 500 });
  }
}