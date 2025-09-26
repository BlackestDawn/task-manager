import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_BASE_URL } from '@/lib/data/consts';
import { TEN_SECONDS } from '@/lib/data/consts';

export interface ApiClientConfig {
  baseURL?: string;
  timeout?: number;
  isServer?: boolean;
}

function getCookie(name: string) {
  if (typeof document === "undefined") return null;

  const cookies = document.cookie.split(";").reduce((acc, cookie) => {
    const [key, ...valueParts] = cookie.trim().split("=");
    if (!key || valueParts.length === 0) return acc;

    const value = valueParts.join("=");
    acc[key] = decodeURIComponent(value);
    return acc;
  }, {} as Record<string, string>);

  return cookies[name] || null;
}

function setCookie(name: string, value: string, options: {
  maxAge?: number;
  path?: string;
  secure?: boolean;
  sameSite?: "strict" | "lax" | "none";
} = {}) {
  if (typeof document === "undefined") return;

  const defaults = {
    path: "/",
    secure: window.location.protocol === "https:",
    sameSite: "lax" as const,
  };

  const cookieOptions = { ...defaults, ...options };
  let cookieString = `${name}=${encodeURIComponent(value)}`;

  Object.entries(cookieOptions).forEach(([key, val]) => {
    if (val === undefined || val === null) return;

    if (typeof val === "boolean" && val) {
      cookieString += `; ${key}`;
    } else if (typeof val !== "boolean") {
      if (key === "maxAge") {
        cookieString += `; max-age=${val}`;
      } else if (key === "sameSite") {
        cookieString += `; Samesite=${val}`;
      } else {
        cookieString += `; ${key}=${val}`;
      }
    }
  });

  document.cookie = cookieString;
}

function removeCookie(name: string, options: { path?: string } = {}) {
  setCookie(name, "", { ...options, maxAge: -1 });
}

export class ApiClient {
  private client: AxiosInstance;
  private isServer: boolean;

  constructor(config: ApiClientConfig) {
    this.isServer = config.isServer || false;

    this.client = axios.create({
      baseURL: config.baseURL || API_BASE_URL,
      timeout: config.timeout || TEN_SECONDS,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Add auth token
    this.client.interceptors.request.use(
      (config) => {
        if (!this.isServer) {
          const accessToken = getCookie("accessToken");
          if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
          }
        }
        return config
      },
      (error) => Promise.reject(error)
    );

    // Refresh token if expired
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = getCookie("refreshToken");
            if (!refreshToken) throw new Error("No refresh token found");

            const response = await this.client.post("/auth/refresh", { token: refreshToken });
            const { accessToken } = response.data;

            setCookie("accessToken", accessToken, { maxAge: 3600 });

            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            removeCookie("accessToken");
            removeCookie("refreshToken");
            this.emitAuthChange();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.put(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete(url, config);
    return response.data;
  }

  setAuthTokens(accessToken: string, refreshToken: string) {
    if (this.isServer) return;

    setCookie("accessToken", accessToken, { maxAge: 3600 });
    setCookie("refreshToken", refreshToken, { maxAge: 3600 * 24 * 60 }); // 60 days
  }

  clearAuthTokens() {
    if (this.isServer) return;

    removeCookie("accessToken");
    removeCookie("refreshToken");
  }

  getAccessToken() {
    if (this.isServer) return;

    return getCookie("accessToken");
  }

  getRefreshToken() {
    if (this.isServer) return;

    return getCookie("refreshToken");
  }

  emitAuthChange() {
    if (!this.isServer && typeof window !== undefined) {
      window.dispatchEvent(new CustomEvent("auth-token-changed"));
    }
  }
}
