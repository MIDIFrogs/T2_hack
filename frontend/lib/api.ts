import {
  ApiResponse,
  CollectionPeriod,
  ScheduleDayPayload,
  ScheduleTemplate,
  Token,
  User,
} from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * API Client for T2 Schedule Backend
 */
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  /**
   * Get auth headers
   */
  private getAuthHeaders(): HeadersInit {
    // Get token from localStorage (client-side only)
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        return {
          Authorization: `Bearer ${token}`,
        };
      }
    }
    return {};
  }

  /**
   * Make API request
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
      ...this.getAuthHeaders(),
      ...options.headers,
    };

    try {
      const response = await fetch(url, { ...options, headers });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: "Unknown error" }));

        // Handle different error formats
        if (typeof error.detail === 'string') {
          throw new Error(error.detail);
        } else if (Array.isArray(error.detail)) {
          // Pydantic validation errors
          const messages = error.detail.map((e: any) => e.msg).join(', ');
          throw new Error(messages);
        } else if (typeof error.detail === 'object') {
          // Nested error object
          throw new Error(JSON.stringify(error.detail));
        } else {
          throw new Error(error.message || "API Error");
        }
      }

      return await response.json();
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }

  /**
   * Auth endpoints
   */
  async login(email: string, password: string): Promise<Token> {
    return this.request<Token>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async register(email: string, password: string, fullName?: string): Promise<Token> {
    return this.request<Token>("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
        full_name: fullName,
      }),
    });
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>("/auth/me");
  }

  /**
   * Schedule endpoints
   */
  async getMySchedule(): Promise<Record<string, ScheduleDayPayload>> {
    return this.request<Record<string, ScheduleDayPayload>>("/schedules/me");
  }

  async getMyLimits(): Promise<{
    available_vacation_days: number;
    available_off_days: number;
    used_vacation_days: number;
    used_off_days: number;
    remaining_vacation_days: number;
    remaining_off_days: number;
  }> {
    return this.request("/schedules/me/limits");
  }

  async updateMySchedule(
    schedule: Record<string, ScheduleDayPayload>
  ): Promise<{ schedule: Record<string, ScheduleDayPayload>; warnings: string[] }> {
    return this.request("/schedules/me", {
      method: "PUT",
      body: JSON.stringify({ days: schedule }),
    });
  }

  /**
   * Periods endpoints
   */
  async getCurrentPeriod(): Promise<CollectionPeriod | null> {
    return this.request<CollectionPeriod | null>("/periods/current");
  }

  /**
   * Templates endpoints
   */
  async getMyTemplates(): Promise<ScheduleTemplate[]> {
    return this.request<ScheduleTemplate[]>("/templates");
  }

  async createTemplate(template: {
    name: string;
    work_days: number;
    rest_days: number;
    shift_start: string;
    shift_end: string;
    has_break: boolean;
    break_start?: string;
    break_end?: string;
  }): Promise<ScheduleTemplate> {
    return this.request<ScheduleTemplate>("/templates", {
      method: "POST",
      body: JSON.stringify(template),
    });
  }

  async deleteTemplate(templateId: number): Promise<void> {
    return this.request<void>(`/templates/${templateId}`, {
      method: "DELETE",
    });
  }
}

// Export singleton instance
export const api = new ApiClient(API_BASE_URL);

/**
 * Helper functions for common operations
 */
export const apiHelpers = {
  /**
   * Save auth token
   */
  saveToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
    }
  },

  /**
   * Get auth token
   */
  getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  },

  /**
   * Clear auth token
   */
  clearToken(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
