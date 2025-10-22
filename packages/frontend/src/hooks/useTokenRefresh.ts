'use client';
import { useEffect, useRef } from "react";
import { tokenManager } from "@/lib/utils/tokenManager";

export function useTokenRefresh() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const initializeTokens = async () => {
      try {
        const response = await fetch("/api/auth/get-tokens", {
          method: "GET",
          cache: "no-store",
        });

        if (response.ok) {
          const data = await response.json();
          if (data.accessToken && data.refreshToken) {
            tokenManager.setToken(data.accessToken, data.refreshToken);
            console.log('✅ Tokens initialized from server');
          }
        }
      } catch (error) {
        console.error("Failed to initialize tokens:", error);
      }
    };

    initializeTokens();

    intervalRef.current = setInterval(async () => {
      const token = tokenManager.getAccessToken();
      if (token && tokenManager.isTokenExpired(token)) {
        console.log('🔄 Token expired, refreshing proactively...');
        await tokenManager.refreshAccessToken();
      }
    }, 5 * 60 * 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
}
