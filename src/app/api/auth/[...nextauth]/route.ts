import { PrismaClient } from "@prisma/client";
import { NextAuthOptions } from "next-auth";
import { compare } from "bcryptjs";
import CredentialsProvider from "next-auth/providers/credentials";
import NextAuth from "next-auth/next";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        // session.user.image = token.image;
      }
      return session;
    }
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("请提供邮箱和密码");
          }
          
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email
            }
          });
          
          if (!user) {
            throw new Error("用户不存在");
          }
          
          const isPasswordValid = await compare(
            credentials.password,
            user.password
          );
          
          if (!isPasswordValid) {
            throw new Error("密码错误");
          }
          
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image
          };
        } catch (error) {
          throw error
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60 // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
  pages: {
    signIn: "/login"
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };