import { betterAuth } from "better-auth";
import { z } from "zod";

/**
 * Environment variable validation for serverless
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("production"),
  JWT_SECRET: z.string().min(32),
  VERCEL_URL: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  PHP_API_URL: z.string().url(),
  PHP_AUTH_SECRET: z.string().min(32),
});

const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV || "production",
  JWT_SECRET: process.env.JWT_SECRET,
  VERCEL_URL: process.env.VERCEL_URL,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  PHP_API_URL: process.env.PHP_API_URL,
  PHP_AUTH_SECRET: process.env.PHP_AUTH_SECRET,
});

function getBaseUrl(): string {
  if (env.VERCEL_URL) {
    return env.VERCEL_URL.startsWith("http")
      ? env.VERCEL_URL
      : `https://${env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

/**
 * PHP Client for user sync
 */
class PhpClient {
  private readonly baseUrl: string;
  private readonly authSecret: string;

  constructor() {
    this.baseUrl = env.PHP_API_URL;
    this.authSecret = env.PHP_AUTH_SECRET;
  }

  async getUserByEmail(email: string) {
    try {
      const url = `${this.baseUrl}/auth/ba-user?email=${encodeURIComponent(email)}`;
      const response = await fetch(url, {
        headers: {
          "X-Auth-Secret": this.authSecret,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 404) return null;
      if (!response.ok) throw new Error(`Failed to get user: ${response.status}`);

      const data = await response.json();
      return data.success && data.data ? data.data : null;
    } catch (error) {
      console.error("[PhpClient] Error:", error);
      throw error;
    }
  }

  async createOrUpdateUser(userData: any) {
    try {
      const url = `${this.baseUrl}/auth/ba-user`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "X-Auth-Secret": this.authSecret,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) throw new Error(`Failed to create user: ${response.status}`);

      const data = await response.json();
      if (!data.success || !data.data) {
        throw new Error(data.error || "Invalid response from PHP API");
      }

      return data.data;
    } catch (error) {
      console.error("[PhpClient] Error:", error);
      throw error;
    }
  }
}

const phpClient = new PhpClient();

/**
 * Better-Auth Configuration
 */
export const auth = betterAuth({
  appName: "Marta Dashboard",
  baseURL: getBaseUrl(),
  secret: env.JWT_SECRET,

  database: {
    type: "memory",
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },

  emailAndPassword: {
    enabled: false,
    requireEmailVerification: false,
  },

  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      redirectURI: `${getBaseUrl()}/api/auth/callback/google`,
    },
  },

  advanced: {
    useSecureCookies: env.NODE_ENV === "production",
    crossSubDomainCookies: {
      enabled: false,
    },
  },

  trustHost: true,

  callbacks: {
    async signIn({ user, account }: any) {
      try {
        console.log("[Better-Auth] Sign-in callback:", user.email);

        const email = user.email;
        const provider = account?.provider || "email";
        const providerId = account?.providerAccountId || user.id;

        let phpUser = await phpClient.getUserByEmail(email);

        if (phpUser) {
          if (phpUser.auth_provider !== provider || phpUser.provider_id !== providerId) {
            phpUser = await phpClient.createOrUpdateUser({
              email,
              provider,
              provider_id: providerId,
              first_name: user.name?.split(" ")[0] || phpUser.first_name,
              last_name: user.name?.split(" ")[1] || phpUser.last_name,
            });
          }
        } else {
          phpUser = await phpClient.createOrUpdateUser({
            email,
            provider,
            provider_id: providerId,
            first_name: user.name?.split(" ")[0] || email.split("@")[0],
            last_name: user.name?.split(" ")[1] || "",
          });
        }

        return {
          user: {
            ...user,
            id: phpUser.id.toString(),
            organizationId: phpUser.organization_id,
            role: phpUser.role,
          },
        };
      } catch (error) {
        console.error("[Better-Auth] Error in signIn callback:", error);
        throw error;
      }
    },

    async session({ session, user }: any) {
      try {
        const phpUser = await phpClient.getUserByEmail(user.email);

        if (!phpUser) {
          throw new Error("User not found");
        }

        if (!phpUser.is_active) {
          throw new Error("User account is not active");
        }

        return {
          ...session,
          user: {
            ...user,
            id: phpUser.id.toString(),
            organizationId: phpUser.organization_id,
            role: phpUser.role,
            firstName: phpUser.first_name,
            lastName: phpUser.last_name,
            avatarUrl: phpUser.avatar_url,
          },
        };
      } catch (error) {
        console.error("[Better-Auth] Error in session callback:", error);
        throw error;
      }
    },
  },
});

export const authHandler = auth.handler;
