import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "./api";
import type { LoginRequest, User } from "@task-manager/common";
import { apiClient } from "../api";

export const AUTH_KEYS = {
  all: ['auth'] as const,
  profile: () => [...AUTH_KEYS.all, 'profile'] as const,
} as const;

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      apiClient.setTokens(data.token, data.refreshToken);
      queryClient.setQueryData(AUTH_KEYS.profile(), {
        id: data.id,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        login: data.login,
        name: data.name,
        email: null,
        disabled: false,
        groups: [],
        __typename: 'User' as const,
      });

      queryClient.invalidateQueries({ queryKey: AUTH_KEYS.profile() });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      const refreshToken = typeof window !== undefined
        ? localStorage.getItem('refresh_token')
        : null;

      if (!refreshToken) return Promise.resolve();

      return authApi.logout(refreshToken);
    },
    onSettled: () => {
      apiClient.clearTokens();
      queryClient.clear();
    },
  });
}

export function useProfile() {
  return useQuery({
    queryKey: AUTH_KEYS.profile(),
    queryFn: authApi.getProfile,
    enabled: typeof window !== "undefined" && Boolean(localStorage.getItem("auth_token")),
    staleTime: 1000 * 60 * 5,
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
