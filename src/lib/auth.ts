import { NextAuthOptions, DefaultSession, DefaultUser } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/lib/prisma"
import type { Adapter } from "next-auth/adapters"

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      is_banned?: boolean;
    } & DefaultSession["user"]
  }
  interface User extends DefaultUser {
    role: string;
    is_banned?: boolean;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Dummy Login",
      credentials: {
        email: { label: "Email Dummy", type: "email", placeholder: "budi@dummy.com" }
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        // Cari user di DB tanpa password (KHUSUS DEVELOPMENT/TESTING)
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });
        if (user) {
          if (user.is_banned) {
            throw new Error("Akun Anda telah diblokir.");
          }
          return { id: user.id, name: user.name, email: user.email, role: user.role, is_banned: user.is_banned };
        }
        return null;
      }
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Check if user exists and is banned in the database before allowing login
      // Especially needed for OAuth like Google
      if (user.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email }
        });
        
        if (dbUser?.is_banned) {
          throw new Error("Akun Anda telah diblokir dari platform.");
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.is_banned = user.is_banned;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.role = token.role as string;
        session.user.is_banned = token.is_banned as boolean | undefined;
      }
      return session;
    }
  }
}
