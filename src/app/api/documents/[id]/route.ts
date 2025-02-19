import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("未授权", { status: 401 });
    }

    const document = await prisma.document.findUnique({
      where: {
        id: params.id,
        authorId: (session.user as any).id,
      },
    });

    if (!document) {
      return new NextResponse("文档不存在", { status: 404 });
    }

    return NextResponse.json(document);
  } catch (error) {
    console.error("获取文档详情失败:", error);
    return new NextResponse("获取文档详情失败", { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("未授权", { status: 401 });
    }

    const { title, content, category, tags } = await request.json();
    if (!title || !content) {
      return new NextResponse("标题和内容不能为空", { status: 400 });
    }

    const document = await prisma.document.findUnique({
      where: {
        id: params.id,
        authorId: (session.user as any).id,
      },
    });

    if (!document) {
      return new NextResponse("文档不存在", { status: 404 });
    }

    const updatedDocument = await prisma.document.update({
      where: {
        id: params.id,
        authorId: (session.user as any).id,
      },
      data: {
        title,
        content,
        category,
        tags,
      },
    });

    return NextResponse.json(updatedDocument);
  } catch (error) {
    console.error("更新文档失败:", error);
    return new NextResponse("更新文档失败", { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("未授权", { status: 401 });
    }

    const document = await prisma.document.findUnique({
      where: {
        id: params.id,
        authorId: (session.user as any).id,
      },
    });

    if (!document) {
      return new NextResponse("文档不存在", { status: 404 });
    }

    await prisma.document.delete({
      where: {
        id: params.id,
        authorId: (session.user as any).id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("删除文档失败:", error);
    return new NextResponse("删除文档失败", { status: 500 });
  }
}