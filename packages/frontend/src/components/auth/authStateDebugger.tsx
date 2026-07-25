'use client';
import { useEffect, useState } from 'react';
import { useAuthContext } from './clientAuthProvider';
import { useMounted } from '@/hooks/useMounted';
import { checkAuthAction } from '@/lib/actions/auth';
import type { AuthState } from '@/lib/data/interfaces/auth';

export default function AuthStateDebugger() {
  const mounted = useMounted();
  const [serverAuthState, setServerAuthState] = useState<AuthState | null>(null);
  const [windowState, setWindowState] = useState<AuthState | null>(null);
  const [cookies, setCookies] = useState<string>('');
  const { user, isAuthenticated, ability } = useAuthContext();

  useEffect(() => {
    // Check window state
    if (typeof window !== 'undefined') {
      Promise.resolve().then(() => {
        setWindowState(window.__INITIAL_AUTH_STATE__ ?? null);
        setCookies(document.cookie);
      });

      // Check server auth state
      checkAuthAction().then(state => {
        setServerAuthState(state);
      });
    }
  }, []);

  if (!mounted || process.env.NODE_ENV !== 'development') return null;

  const hasAccessToken = cookies.includes('accessToken');
  const hasRefreshToken = cookies.includes('refreshToken');

  return (
    <div className="fixed top-0 left-0 bg-black text-white p-4 text-xs z-[10000] max-w-md max-h-screen overflow-auto font-mono">
      <div className="font-bold text-yellow-400 mb-3 text-sm">🔍 Auth State Debugger</div>

      {/* Context State */}
      <div className="mb-4 p-2 bg-gray-900 rounded">
        <div className="font-bold text-blue-400 mb-1">useAuthContext() Result:</div>
        <div className="space-y-1 pl-2">
          <div>
            <span className="text-gray-400">user:</span>{' '}
            <span className={user ? 'text-green-400' : 'text-red-400'}>
              {user ? `${user.name} (${user.id.slice(0, 8)})` : 'null'}
            </span>
          </div>
          <div>
            <span className="text-gray-400">isAuthenticated:</span>{' '}
            <span className={isAuthenticated ? 'text-green-400' : 'text-red-400'}>
              {String(isAuthenticated)}
            </span>
          </div>
          <div>
            <span className="text-gray-400">ability rules:</span>{' '}
            <span className="text-cyan-400">{ability.rules.length} rules</span>
          </div>
        </div>
      </div>

      {/* Window State */}
      <div className="mb-4 p-2 bg-gray-900 rounded">
        <div className="font-bold text-purple-400 mb-1">window.__INITIAL_AUTH_STATE__:</div>
        {windowState ? (
          <div className="space-y-1 pl-2">
            <div>
              <span className="text-gray-400">user:</span>{' '}
              <span className={windowState.user ? 'text-green-400' : 'text-red-400'}>
                {windowState.user ? `${windowState.user.name}` : 'null'}
              </span>
            </div>
            <div>
              <span className="text-gray-400">isAuthenticated:</span>{' '}
              <span className={windowState.isAuthenticated ? 'text-green-400' : 'text-red-400'}>
                {String(windowState.isAuthenticated)}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-red-400 pl-2">NOT SET - ServerAuthProvider missing?</div>
        )}
      </div>

      {/* Server State */}
      <div className="mb-4 p-2 bg-gray-900 rounded">
        <div className="font-bold text-orange-400 mb-1">Server Auth State:</div>
        {serverAuthState ? (
          <div className="space-y-1 pl-2">
            <div>
              <span className="text-gray-400">user:</span>{' '}
              <span className={serverAuthState.user ? 'text-green-400' : 'text-red-400'}>
                {serverAuthState.user ? `${serverAuthState.user.name}` : 'null'}
              </span>
            </div>
            <div>
              <span className="text-gray-400">isAuthenticated:</span>{' '}
              <span className={serverAuthState.isAuthenticated ? 'text-green-400' : 'text-red-400'}>
                {String(serverAuthState.isAuthenticated)}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-gray-400 pl-2">Loading...</div>
        )}
      </div>

      {/* Cookies */}
      <div className="mb-4 p-2 bg-gray-900 rounded">
        <div className="font-bold text-pink-400 mb-1">Browser Cookies:</div>
        <div className="space-y-1 pl-2">
          <div>
            <span className="text-gray-400">accessToken:</span>{' '}
            <span className={hasAccessToken ? 'text-green-400' : 'text-red-400'}>
              {hasAccessToken ? '✓ Present' : '✗ Missing'}
            </span>
          </div>
          <div>
            <span className="text-gray-400">refreshToken:</span>{' '}
            <span className={hasRefreshToken ? 'text-green-400' : 'text-red-400'}>
              {hasRefreshToken ? '✓ Present' : '✗ Missing'}
            </span>
          </div>
          {cookies && (
            <div className="text-gray-500 text-[10px] mt-1 break-all">
              {cookies || 'No cookies'}
            </div>
          )}
        </div>
      </div>

      {/* Diagnosis */}
      <div className="p-2 bg-red-900 rounded">
        <div className="font-bold text-red-300 mb-1">🔎 Diagnosis:</div>
        <div className="text-xs space-y-1">
          {!windowState && (
            <div className="text-red-200">
              ❌ ServerAuthProvider not rendering - check layout.tsx
            </div>
          )}
          {windowState && !windowState.user && !hasAccessToken && (
            <div className="text-yellow-200">
              ⚠️ User not logged in - no auth cookies found
            </div>
          )}
          {windowState && !windowState.user && hasAccessToken && (
            <div className="text-orange-200">
              ⚠️ Cookies present but auth state is null - token might be invalid
            </div>
          )}
          {windowState && windowState.user && user && (
            <div className="text-green-200">
              ✓ Everything looks good!
            </div>
          )}
          {windowState && windowState.user && !user && (
            <div className="text-orange-200">
              ⚠️ Window state has user but context doesn&apos;t - hydration issue?
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-3 text-[10px] text-gray-400">
        Press F12 to open DevTools for more info
      </div>
    </div>
  );
}
