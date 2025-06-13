import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { Session } from "next-auth";
import Google from "next-auth/providers/google";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      accessToken?: string;
      role?: string;
      isActive?: boolean;
      isBlocked?: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    userId?: string;
    role?: string;
    isActive?: boolean;
    isBlocked?: boolean;
  }
}

const config = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code"
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {    async signIn({ user, account }) {
      if (!user.email || !account) {
        console.error('Missing user email or account in signIn callback');
        return false;
      }

      try {
        const apiUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        console.log('Attempting to create/update user:', { 
          email: user.email, 
          googleId: user.id 
        });

        // Check user status in API route instead of direct DB access
        const response = await fetch(`${apiUrl}/api/auth/check-user`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: user.email,
            googleId: user.id,
            name: user.name,
            image: user.image,
            accessToken: account.access_token,
            refreshToken: account.refresh_token,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Failed to create/update user:', {
            status: response.status,
            statusText: response.statusText,
            error: errorData
          });
          return false;
        }

        const data = await response.json();
        if (data.isBlocked) {
          console.log('User is blocked:', { email: user.email });
          return false;
        }

        console.log('User successfully authenticated:', { email: user.email });
        return true;
      } catch (error) {
        console.error('Error in signIn callback:', error);
        return false;
      }
    },    async jwt({ token, account, user, trigger, session }) {
      if (account && user) {
        console.log('Setting initial JWT token:', { userId: user.id });
        // Initial sign in
        return {
          ...token,
          accessToken: account.access_token,
          userId: user.id,
          role: 'user',
          isActive: true,
          isBlocked: false
        };
      }

      if (trigger === "update" && session) {
        console.log('Updating JWT token from session');
        // Update the token when session is updated
        return { ...token, ...session.user };
      }

      return token;
    },    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        console.log('Setting session from token:', { 
          userId: token.userId,
          role: token.role
        });
        session.user.id = token.userId as string;
        session.user.accessToken = token.accessToken as string;
        session.user.role = token.role as string;
        session.user.isActive = token.isActive as boolean;
        session.user.isBlocked = token.isBlocked as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
    signOut: '/auth/signout',
    verifyRequest: '/auth/verify-request',
    newUser: '/auth/new-user'
  },
  secret: process.env.NEXTAUTH_SECRET,
  basePath: '/api/auth',
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);
