import { env } from "./env";
import type { CreateUserRequest, PhpApiResponse, PhpUser } from "./types";

/**
 * PHP Backend API Client
 * Handles communication with the PHP backend for user operations
 */
export class PhpClient {
  private readonly baseUrl: string;
  private readonly authSecret: string;

  constructor() {
    this.baseUrl = env.PHP_API_URL;
    this.authSecret = env.PHP_AUTH_SECRET;
  }

  /**
   * Get user by email from PHP backend
   */
  async getUserByEmail(email: string): Promise<PhpUser | null> {
    try {
      const url = `${this.baseUrl}/auth/ba-user?email=${encodeURIComponent(email)}`;

      console.log(`[PhpClient] Getting user by email: ${email}`);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "X-Auth-Secret": this.authSecret,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 404) {
        console.log(`[PhpClient] User not found: ${email}`);
        return null;
      }

      if (!response.ok) {
        const error = await response.text();
        console.error(`[PhpClient] Error getting user: ${response.status} - ${error}`);
        throw new Error(`Failed to get user: ${response.status}`);
      }

      const data = await response.json() as PhpApiResponse<PhpUser>;

      if (!data.success || !data.data) {
        console.error(`[PhpClient] Invalid response:`, data);
        throw new Error("Invalid response from PHP API");
      }

      console.log(`[PhpClient] User found: ${email} (ID: ${data.data.id})`);
      return data.data;
    } catch (error) {
      console.error(`[PhpClient] Error in getUserByEmail:`, error);
      throw error;
    }
  }

  /**
   * Create or update user in PHP backend
   */
  async createOrUpdateUser(userData: CreateUserRequest): Promise<PhpUser> {
    try {
      const url = `${this.baseUrl}/auth/ba-user`;

      console.log(`[PhpClient] Creating/updating user: ${userData.email}`);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "X-Auth-Secret": this.authSecret,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error(`[PhpClient] Error creating user: ${response.status} - ${error}`);
        throw new Error(`Failed to create user: ${response.status}`);
      }

      const data = await response.json() as PhpApiResponse<PhpUser>;

      if (!data.success || !data.data) {
        console.error(`[PhpClient] Invalid response:`, data);
        throw new Error(data.error || "Invalid response from PHP API");
      }

      console.log(`[PhpClient] User created/updated: ${userData.email} (ID: ${data.data.id})`);
      return data.data;
    } catch (error) {
      console.error(`[PhpClient] Error in createOrUpdateUser:`, error);
      throw error;
    }
  }

  /**
   * Check if PHP backend is reachable
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      // We expect a 401 (no token), which means the server is up
      return response.status === 401;
    } catch (error) {
      console.error("[PhpClient] Health check failed:", error);
      return false;
    }
  }
}

/**
 * Singleton instance
 */
export const phpClient = new PhpClient();
