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

  useEffect(() => {
    const checkAuth = () => setHashydrated(true);

    checkAuth();
    window.addEventListener("auth-token-changed", checkAuth);

    return () => {
      window.removeEventListener("auth-token-changed", checkAuth);
    };
  }, []);

  return useQuery({
    queryKey: AUTH_KEYS.profile(),
    queryFn: authApi.getProfile,
    enabled: hasHydrated,
    initialData: initialState?.user,
    staleTime: FIVE_MINUTES,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) return false;
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
