import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/lib/prisma"
import type { Adapter } from "next-auth/adapters"

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
          return { id: user.id, name: user.name, email: user.email };
        }
        return null;
      }
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        // Simpan user ID di session agar mudah diakses
        // @ts-ignore
        session.user.id = token.sub;
      }
      return session;
    }
  }
}
