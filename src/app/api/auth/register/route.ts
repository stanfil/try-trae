import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

const prisma = new PrismaClient();

const registerSchema = z.object({
  name: z.string().min(2, "名字至少需要2个字符"),
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(6, "密码至少需要6个字符")
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = registerSchema.parse(body);

    // 检查邮箱是否已被注册
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "该邮箱已被注册" },
        { status: 400 }
      );
    }

    // 加密密码
    const hashedPassword = await hash(password, 10);

    // 创建新用户
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword
      }
    });

    return NextResponse.json(
      { message: "注册成功", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "输入数据验证失败", errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "注册失败，请稍后重试" },
      { status: 500 }
    );
  }
}