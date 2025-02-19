import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("未授权", { status: 401 });
    }

    const document = await prisma.document.update({
      where: {
        id: params.id,
      },
      data: {
        views: {
          increment: 1,
        },
      },
    });

    return NextResponse.json(document);
  } catch (error) {
    console.error("更新阅读量失败:", error);
    return new NextResponse("更新阅读量失败", { status: 500 });
  }
}