export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  statusCode?: number;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api/v1';

async function handleResponse(response: Response): Promise<ApiResponse> {
  const contentType = response.headers.get("content-type");
  let data: any;

  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    // If it's the standard error format from our backend
    if (typeof data === 'object' && data !== null && 'success' in data) {
      return {
        success: false,
        error: data.message || "An unexpected error occurred",
        code: data.code || "UNKNOWN_ERROR",
        statusCode: response.status,
      };
    }

    // Fallback for other errors
    return {
      success: false,
      error: typeof data === 'string' ? data : "An unexpected error occurred",
      code: "FETCH_ERROR",
      statusCode: response.status,
    };
  }

  return {
    success: true,
    data: data,
  };
}

export const api = {
  async get<T = any>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      return await handleResponse(response);
    } catch (error: any) {
      return {
        success: false,
        error: "Network error. Please check your connection.",
        code: "NETWORK_ERROR",
      };
    }
  },

  async post<T = any>(endpoint: string, body: any, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        body: JSON.stringify(body),
      });
      return await handleResponse(response);
    } catch (error: any) {
      return {
        success: false,
        error: "Network error. Please check your connection.",
        code: "NETWORK_ERROR",
      };
    }
  },

  async put<T = any>(endpoint: string, body: any, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        body: JSON.stringify(body),
      });
      return await handleResponse(response);
    } catch (error: any) {
      return {
        success: false,
        error: "Network error. Please check your connection.",
        code: "NETWORK_ERROR",
      };
    }
  },

  async patch<T = any>(endpoint: string, body: any, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        body: JSON.stringify(body),
      });
      return await handleResponse(response);
    } catch (error: any) {
      return {
        success: false,
        error: "Network error. Please check your connection.",
        code: "NETWORK_ERROR",
      };
    }
  },

  async delete<T = any>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      return await handleResponse(response);
    } catch (error: any) {
      return {
        success: false,
        error: "Network error. Please check your connection.",
        code: "NETWORK_ERROR",
      };
    }
  },
};
