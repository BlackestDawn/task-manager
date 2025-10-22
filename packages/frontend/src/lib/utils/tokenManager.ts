import { API_BASE_URL } from "@/lib/data/consts";
import type { RefreshAccessTokenResponse } from "@task-manager/common";

class TokenManager {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private refreshPromise: Promise<string | null> | null = null;
  private isRefreshing: boolean = false;

  setToken(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  getAccessToken() {
    return this.accessToken;
  }

  getRefreshToken() {
    return this.refreshToken;
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    this.refreshPromise = null;
    this.isRefreshing = false;
  }

  isTokenExpired(token: string) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1] || "0"));
      const exp = payload.exp;
      const now = Math.floor(Date.now() / 1000);
      return exp - now < 60;
    } catch (error) {
      console.error("Error decoding token:", error);
      return true;
    }
  }

  async refreshAccessToken() {
    if (this.isRefreshing && this.refreshPromise) return this.refreshPromise;

    this.isRefreshing = true;
    this.refreshPromise = this._doRefresh();

    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  private async _doRefresh() {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      console.warn("No refresh token available");
      return null;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
        cache: "no-store",
      });

      if (!response.ok) {
        console.error("Token refresh failed:", response.status);
        return null;
      }

      const data: RefreshAccessTokenResponse = await response.json();
      this.setToken(data.accessToken, refreshToken);

      try {
        await fetch("/api/auth/update-cookies", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            accessToken: this.accessToken,
            refreshToken,
          }),
        });
      } catch (error) {
        console.warn("Failed to update server cookies", error);
      }

      return data.accessToken;
    } catch (error) {
      console.error("Error refreshing access token:", error);
      return null;
    }
  }

  async getValidTokens() {
    let token = this.getAccessToken();

    if (!token) {
      const tokens = await this.fetchTokensFromServer();
      if (!tokens) return null;
      token = tokens.accessToken;
    }

    if (token && this.isTokenExpired(token)){
      console.log("Access token expired, refreshing...");
      const newToken = await this.refreshAccessToken();
      if (!newToken) {
        console.error("Failed to refresh token");
        return null;
      }
      return newToken;
    }
    return token;
  }

  private async fetchTokensFromServer() {
    try {
      const response = await fetch("/api/auth/get-tokens", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) return null;

      const data = await response.json();
      if (data.accessToken && data.refreshToken) {
        this.setToken(data.accessToken, data.refreshToken);
        return data;
      }

      return null;
    } catch (error) {
      console.error("Error fetching tokens from server:", error);
      return null;
    }
  }
}

export const tokenManager = new TokenManager();
