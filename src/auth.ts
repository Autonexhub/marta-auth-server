import { betterAuth } from "better-auth";
import { env, getBaseUrl } from "./env";
import { phpClient } from "./php-client";
import type { PhpUser } from "./types";

/**
 * Better-Auth Configuration
 *
 * This server handles OAuth and magic link authentication,
 * then syncs user data with the PHP backend and generates
 * JWT tokens compatible with the existing PHP system.
 */
export const auth = betterAuth({
  appName: "Marta Dashboard",
  baseURL: getBaseUrl(),
  secret: env.JWT_SECRET,

  // Database: We don't need a database - we're stateless
  // User data is managed by PHP backend
  database: {
    type: "memory", // No persistence needed
  },

  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update session every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },

  // Email and password (disabled for now - Phase 5)
  emailAndPassword: {
    enabled: false,
    requireEmailVerification: false,
  },

  // Social providers
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      redirectURI: `${getBaseUrl()}/api/auth/callback/google`,
    },
  },

  // Advanced configuration
  advanced: {
    useSecureCookies: env.NODE_ENV === "production",
    crossSubDomainCookies: {
      enabled: false,
    },
  },

  // Trust proxy (required for Vercel)
  trustHost: true,

  // Callbacks for custom logic
  callbacks: {
    /**
     * Called after successful sign-in (OAuth or magic link)
     * We sync user with PHP backend here
     */
    async signIn({ user, account }) {
      try {
        console.log("[Better-Auth] Sign-in callback triggered");
        console.log("[Better-Auth] User:", user.email);
        console.log("[Better-Auth] Account:", account?.provider);

        // Sync user with PHP backend
        const phpUser = await syncUserWithPhp(user, account);

        console.log("[Better-Auth] User synced with PHP backend");

        // Return user data enriched from PHP
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

    /**
     * Called when creating a session
     * We enrich session data with PHP user info
     */
    async session({ session, user }) {
      try {
        console.log("[Better-Auth] Session callback for user:", user.email);

        // Get latest user data from PHP
        const phpUser = await phpClient.getUserByEmail(user.email);

        if (!phpUser) {
          console.error("[Better-Auth] User not found in PHP backend");
          throw new Error("User not found");
        }

        if (!phpUser.is_active) {
          console.error("[Better-Auth] User is not active");
          throw new Error("User account is not active");
        }

        // Enrich session with PHP data
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

/**
 * Sync user with PHP backend
 * Creates or updates user based on OAuth data
 */
async function syncUserWithPhp(user: any, account: any): Promise<PhpUser> {
  const email = user.email;
  const provider = account?.provider || "email";
  const providerId = account?.providerAccountId || user.id;

  console.log(`[syncUserWithPhp] Syncing user: ${email} (provider: ${provider})`);

  try {
    // Try to get existing user first
    let phpUser = await phpClient.getUserByEmail(email);

    if (phpUser) {
      console.log(`[syncUserWithPhp] Existing user found: ${phpUser.id}`);

      // Update provider info if needed
      if (phpUser.auth_provider !== provider || phpUser.provider_id !== providerId) {
        console.log(`[syncUserWithPhp] Updating provider info`);
        phpUser = await phpClient.createOrUpdateUser({
          email,
          provider,
          provider_id: providerId,
          first_name: user.name?.split(" ")[0] || phpUser.first_name,
          last_name: user.name?.split(" ")[1] || phpUser.last_name,
        });
      }
    } else {
      console.log(`[syncUserWithPhp] Creating new user`);

      // Create new user
      phpUser = await phpClient.createOrUpdateUser({
        email,
        provider,
        provider_id: providerId,
        first_name: user.name?.split(" ")[0] || email.split("@")[0],
        last_name: user.name?.split(" ")[1] || "",
      });
    }

    return phpUser;
  } catch (error) {
    console.error("[syncUserWithPhp] Error:", error);
    throw new Error(`Failed to sync user with PHP backend: ${error}`);
  }
}

/**
 * Export auth handler for API routes
 */
export const authHandler = auth.handler();
