import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function POST(
  request: Request,
  context: { params: { id: string } }
) {
  const { params } = context;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("未授权", { status: 401 });
    }

    // 检查用户是否已经点赞过该文档
    const existingLike = await prisma.documentLike.findUnique({
      where: {
        documentId_userId: {
          documentId: params.id,
          userId: (session.user as any).id,
        },
      },
    });

    if (existingLike) {
      // 如果已经点赞，则取消点赞
      await prisma.$transaction([
        prisma.documentLike.delete({
          where: {
            id: existingLike.id,
          },
        }),
        prisma.document.update({
          where: {
            id: params.id,
          },
          data: {
            likes: {
              decrement: 1,
            },
          },
        }),
      ]);
    } else {
      // 如果未点赞，则添加点赞
      await prisma.$transaction([
        prisma.documentLike.create({
          data: {
            documentId: params.id,
            userId: (session.user as any).id,
          },
        }),
        prisma.document.update({
          where: {
            id: params.id,
          },
          data: {
            likes: {
              increment: 1,
            },
          },
        }),
      ]);
    }

    const updatedDocument = await prisma.document.findUnique({
      where: {
        id: params.id,
      },
      include: {
        likedBy: true,
      },
    });

    return NextResponse.json(updatedDocument);
  } catch (error) {
    console.error("点赞操作失败:", error);
    return new NextResponse("点赞操作失败", { status: 500 });
  }
}