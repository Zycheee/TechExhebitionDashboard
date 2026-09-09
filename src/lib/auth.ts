import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || "lifewood-secret-key-super-secure-2026",
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 Hours JWT Session Expiration
  },
  jwt: {
    maxAge: 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const normalizedEmail = credentials.email.toLowerCase().trim();

        // Security Rate Limiting: Max 5 login attempts per 15 minutes per email account
        const rateLimitResult = checkRateLimit(
          `login-attempt-${normalizedEmail}`,
          5,
          15 * 60 * 1000
        );

        if (!rateLimitResult.success) {
          throw new Error(
            "Too many failed login attempts. Account temporarily locked for 15 minutes."
          );
        }

        const user = await db.user.findUnique({
          where: { email: normalizedEmail },
        });

        if (!user || !user.passwordHash) {
          throw new Error("No user found with this email");
        }

        let isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isPasswordValid && credentials.password === user.passwordHash) {
          isPasswordValid = true;
        }

        if (!isPasswordValid) {
          throw new Error("Incorrect password");
        }

        return {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).email = token.email;
        (session.user as any).name = token.name;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
};
