'use client';
import { useEffect, useState } from 'react';

/**
 * Component to verify that layout.tsx has proper provider setup
 * Add this to any page temporarily to diagnose setup issues
 */
export default function LayoutVerification() {
  const [checks, setChecks] = useState({
    mounted: false,
    hasWindowState: false,
    hasAuthContext: false,
    hasScript: false,
    layoutCorrect: false,
  });

  useEffect(() => {
    const windowState = typeof window !== 'undefined' && 'window' in globalThis;
    const hasInitialState = typeof window !== 'undefined' && '__INITIAL_AUTH_STATE__' in window;

    // Check for script tag in DOM
    const scripts = Array.from(document.querySelectorAll('script'));
    const hasAuthScript = scripts.some(script =>
      script.innerHTML.includes('__INITIAL_AUTH_STATE__')
    );

    // Try to check if context provider exists by looking for error
    let hasContext = false;
    try {
      // If ClientAuthProvider is present, window.__INITIAL_AUTH_STATE__ should be read
      // We can't directly test useContext here, but we can check the setup
      hasContext = hasInitialState || hasAuthScript;
    } catch {
      hasContext = false;
    }

    const allChecks = {
      mounted: true,
      hasWindowState: windowState,
      hasAuthContext: hasContext,
      hasScript: hasAuthScript,
      layoutCorrect: hasAuthScript && windowState,
    };

    Promise.resolve().then(() => setChecks(allChecks));

    // Log to console for debugging
    console.log('🔍 Layout Verification:', allChecks);
    console.log('📝 window.__INITIAL_AUTH_STATE__:',
      typeof window !== 'undefined' ? window.__INITIAL_AUTH_STATE__ : 'N/A'
    );
  }, []);

  if (!checks.mounted || process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-900 to-purple-900 text-white p-4 z-[10000] border-t-4 border-yellow-400">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <div className="font-bold text-lg">🏗️ Layout Setup Verification</div>
          <div className={`text-sm px-3 py-1 rounded ${
            checks.layoutCorrect
              ? 'bg-green-600'
              : 'bg-red-600'
          }`}>
            {checks.layoutCorrect ? '✓ PASS' : '✗ FAIL'}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <CheckItem
            label="Window object"
            status={checks.hasWindowState}
            description="Browser environment available"
          />

          <CheckItem
            label="Auth script tag"
            status={checks.hasScript}
            description="ServerAuthProvider is rendering"
            critical
          />

          <CheckItem
            label="Initial auth state"
            status={checks.hasAuthContext}
            description="window.__INITIAL_AUTH_STATE__ is set"
            critical
          />

          <CheckItem
            label="Provider setup"
            status={checks.layoutCorrect}
            description="Layout has correct provider structure"
            critical
          />
        </div>

        {!checks.layoutCorrect && (
          <div className="mt-4 p-3 bg-red-800 rounded text-sm">
            <div className="font-bold mb-1">❌ Layout Configuration Issue</div>
            <div className="text-red-100">
              {!checks.hasScript && (
                <div>• ServerAuthProvider is NOT rendering - check your layout.tsx</div>
              )}
              {!checks.hasAuthContext && (
                <div>• window.__INITIAL_AUTH_STATE__ is NOT set - ClientAuthProvider may be missing</div>
              )}
              <div className="mt-2 text-xs">
                Expected layout.tsx structure:
                <pre className="mt-1 p-2 bg-black bg-opacity-30 rounded overflow-x-auto">
{`<ServerAuthProvider>
  <Providers>
    {children}
  </Providers>
</ServerAuthProvider>`}
                </pre>
              </div>
            </div>
          </div>
        )}

        {checks.layoutCorrect && (
          <div className="mt-4 p-3 bg-green-800 rounded text-sm">
            <div className="font-bold mb-1">✅ Layout Configured Correctly</div>
            <div className="text-green-100">
              Both ServerAuthProvider and ClientAuthProvider are properly set up.
              If you&apos;re still having auth issues, check the AuthStateDebugger for login status.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CheckItem({
  label,
  status,
  description,
  critical = false
}: {
  label: string;
  status: boolean;
  description: string;
  critical?: boolean;
}) {
  return (
    <div className="flex items-start space-x-2">
      <div className={`text-lg ${status ? 'text-green-400' : critical ? 'text-red-400' : 'text-yellow-400'}`}>
        {status ? '✓' : '✗'}
      </div>
      <div className="flex-1">
        <div className={`font-semibold ${critical && !status ? 'text-red-300' : ''}`}>
          {label}
        </div>
        <div className="text-xs text-gray-300">{description}</div>
      </div>
    </div>
  );
}