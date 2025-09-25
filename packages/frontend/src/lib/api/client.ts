import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_BASE_URL } from '@/lib/data/consts';

export interface ApiClientConfig {
  baseURL?: string;
  timeout?: number;
  isServer?: boolean;
}

export class ApiClient {
  private client: AxiosInstance;
  private isServer: boolean;

  constructor(config: ApiClientConfig) {
    this.isServer = config.isServer || false;

    this.client = axios.create({
      baseURL: config.baseURL || API_BASE_URL,
      timeout: config.timeout || 10000,
      headers: {
        "Content-Type": "application/json",
        "X-Client-Type": "web",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Add auth token
    this.client.interceptors.request.use(
      (config) => config,
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
            await this.client.post("/auth/refresh", {});
            return this.client(originalRequest);
          } catch (refreshError) {
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

  emitAuthChange() {
    if (!this.isServer && typeof window !== undefined) {
      window.dispatchEvent(new CustomEvent("auth-token-changed"));
    }
  }
}
