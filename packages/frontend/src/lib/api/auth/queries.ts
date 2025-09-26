import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { authApi } from "./api";
import { apiClient } from "@/lib/api";
import type { AuthState } from "@/lib/data/interfaces/auth";
import { FIVE_MINUTES } from "@/lib/data/consts";

export const AUTH_KEYS = {
  all: ['auth'] as const,
  profile: () => [...AUTH_KEYS.all, 'profile'] as const,
} as const;

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      if (data.user) {
        queryClient.setQueryData(AUTH_KEYS.profile(), data.user);
      }

      apiClient.emitAuthChange();
      queryClient.invalidateQueries({ queryKey: AUTH_KEYS.profile() });
    },
    onError: (error) => {
      console.log("login API call failed:", error);
      apiClient.clearAuthTokens();
    }
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onMutate: async () => {
      queryClient.setQueryData(AUTH_KEYS.profile(), null);
    },
    onSettled: () => {
      apiClient.emitAuthChange();
      queryClient.invalidateQueries({ queryKey: AUTH_KEYS.profile() });
      queryClient.removeQueries({ queryKey: AUTH_KEYS.profile() });
      queryClient.clear();
    },
    onError: (error) => {
      console.warn("logout API call failed, but clearing local state:", error);
    },
  });
}

export function useProfile(initialState?: AuthState | null) {
  const [hasHydrated, setHashydrated] = useState<boolean>(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkAuth = () => {
      setHashydrated(true)
      queryClient.invalidateQueries({ queryKey: AUTH_KEYS.profile() });
    };

    checkAuth();
    window.addEventListener("auth-token-changed", checkAuth);

    return () => {
      window.removeEventListener("auth-token-changed", checkAuth);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: AUTH_KEYS.profile(),
    queryFn: authApi.getProfile,
    enabled: hasHydrated && (!!apiClient.getAccessToken() || !!initialState?.user),
    initialData: initialState?.user || undefined,
    staleTime: FIVE_MINUTES,
    refetchOnWindowFocus: true,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) {
        apiClient.clearAuthTokens();
        return false
      };
      return failureCount < 3;
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(AUTH_KEYS.profile(), data);
    },
  });
}
