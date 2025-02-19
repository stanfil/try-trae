import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authOptions } from "./app/api/auth/[...nextauth]/route";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
    cookieName: process.env.NODE_ENV === "production" ? "__Secure-next-auth.session-token" : "next-auth.session-token"
  });

  console.log("[Middleware] Current path:", request.nextUrl.pathname);
  console.log("[Middleware] Token:", token);

  // 允许访问的公开路径
  const publicPaths = ["/auth"];
  const isPublicPath = publicPaths.some(path => request.nextUrl.pathname.startsWith(path));

  // API 路由和认证回调路由不需要重定向
  if (request.nextUrl.pathname.startsWith("/api") || request.nextUrl.pathname.includes("/auth/callback")) {
    return NextResponse.next();
  }

  // 如果用户未登录且访问的不是公开路径，重定向到登录页面
  if (!token && !isPublicPath) {
    console.log("[Middleware] Redirecting to auth page - No token found");
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  // 如果用户已登录且访问登录/注册页面，重定向到首页
  if (token && isPublicPath) {
    console.log("[Middleware] Redirecting to home page - User already authenticated");
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

// 配置中间件匹配的路由
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};