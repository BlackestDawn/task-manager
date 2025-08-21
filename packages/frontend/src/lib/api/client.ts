import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import type { LoginResponse } from '@task-manager/common';

export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
}

export class ApiClient {
  private client: AxiosInstance;
  private tokenStorage = {
    getToken: () => typeof window !== "undefined" ? localStorage.getItem("auth_token") : null,
    setToken: (token: string) => {
      if (typeof window !== "undefined") localStorage.setItem("auth_token", token);
    },
    getRefreshToken: () => typeof window !== "undefined" ? localStorage.getItem("refresh_token") : null,
    setRefreshToken: (token: string) => {
      if (typeof window !== "undefined") localStorage.setItem("refresh_token", token);
    },
    clearTokens: () => {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("refresh_token");
    },
  };

  constructor(config: ApiClientConfig) {
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.tokenStorage.getToken();
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
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

          const refreshToken = this.tokenStorage.getRefreshToken();
          if (refreshToken) {
            try {
              const response = await this.refreshToken(refreshToken);
              this.tokenStorage.setToken(response.token);
              this.tokenStorage.setRefreshToken(response.refreshToken)

              originalRequest.headers.Authorization = `Bearer ${response.token}`;
              return this.client(originalRequest);
            } catch (refreshError) {
              this.tokenStorage.clearTokens();
              return Promise.reject(refreshError)
            }
          } else {
            this.tokenStorage.clearTokens();
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private async refreshToken(refreshToken: string) {
    const response = await axios.post(`${this.client.defaults.baseURL}/auth/refresh`, { token: refreshToken });
    return response.data as LoginResponse;
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

  setTokens(token: string, refreshToken: string) {
    this.tokenStorage.setToken(token);
    this.tokenStorage.setRefreshToken(refreshToken);
  }

  clearTokens() {
    this.tokenStorage.clearTokens();
  }
}
