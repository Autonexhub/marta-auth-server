/**
 * User data from PHP backend
 */
export interface PhpUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  organization_id: number;
  role: string;
  auth_provider: string | null;
  provider_id: string | null;
  is_active: boolean;
  avatar_url?: string | null;
  phone?: string | null;
  default_organization_id?: number | null;
  last_login_at?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * User creation request to PHP backend
 */
export interface CreateUserRequest {
  email: string;
  provider: string;
  provider_id: string;
  first_name?: string;
  last_name?: string;
}

/**
 * PHP API response wrapper
 */
export interface PhpApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * OAuth provider types
 */
export type OAuthProvider = "google" | "github" | "microsoft";

/**
 * Auth provider type (includes magic link and email)
 */
export type AuthProvider = OAuthProvider | "email" | "magic_link";

/**
 * Better-Auth user object
 */
export interface BetterAuthUser {
  id: string;
  email: string;
  name?: string;
  image?: string;
  emailVerified?: boolean;
}

/**
 * Better-Auth account object
 */
export interface BetterAuthAccount {
  provider: string;
  providerAccountId: string;
  type: string;
}

/**
 * Better-Auth session object
 */
export interface BetterAuthSession {
  id: string;
  userId: string;
  expiresAt: Date;
  token: string;
}
