// packages/frontend/src/components/auth/canDebug.tsx
'use client';
import { useAuthContext } from "./clientAuthProvider";
import type { User, Task, Group, Actions, Subjects } from "@task-manager/common";

interface CanDebugProps {
  action: string;
  subject: string | User | Task | Group;
  field?: string;
}

/**
 * Debug component to test CASL permissions
 * Use this temporarily to diagnose permission issues
 *
 * Usage:
 * <CanDebug action="update" subject={user} />
 * <CanDebug action="create" subject="User" />
 */
export function CanDebug({ action, subject, field }: CanDebugProps) {
  const { ability, user } = useAuthContext();

  if (process.env.NODE_ENV !== 'development') return null;

  const isString = typeof subject === 'string';
  const hasTypename = !isString && subject && '__typename' in subject;
  const typename = hasTypename ? String((subject as Record<string, unknown>).__typename) : 'N/A';

  let canDo = false;
  try {
    canDo = field
      ? ability.can(action as Actions, subject as Subjects, field)
      : ability.can(action as Actions, subject as Subjects);
  } catch (error) {
    console.error('Error checking ability:', error);
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 text-xs rounded shadow-lg max-w-sm z-50 font-mono">
      <div className="font-bold mb-2 text-yellow-400">🔍 CASL Permission Debug</div>

      <div className="space-y-1">
        <div>
          <span className="text-gray-400">Action:</span> <span className="text-green-400">{action}</span>
        </div>

        <div>
          <span className="text-gray-400">Subject Type:</span>{' '}
          <span className={isString ? 'text-blue-400' : 'text-purple-400'}>
            {isString ? `"${subject}"` : 'Object'}
          </span>
        </div>

        {!isString && (
          <>
            <div>
              <span className="text-gray-400">Has __typename:</span>{' '}
              <span className={hasTypename ? 'text-green-400' : 'text-red-400'}>
                {hasTypename ? 'Yes' : 'No'}
              </span>
            </div>

            {hasTypename && (
              <div>
                <span className="text-gray-400">__typename Value:</span>{' '}
                <span className="text-cyan-400">{typename}</span>
              </div>
            )}

            <div>
              <span className="text-gray-400">Object ID:</span>{' '}
              <span className="text-cyan-400">{String((subject as Record<string, unknown>).id ?? 'N/A')}</span>
            </div>
          </>
        )}

        {field && (
          <div>
            <span className="text-gray-400">Field:</span>{' '}
            <span className="text-yellow-400">{field}</span>
          </div>
        )}

        <div className="pt-2 border-t border-gray-700 mt-2">
          <span className="text-gray-400">Result:</span>{' '}
          <span className={canDo ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
            {canDo ? '✓ ALLOWED' : '✗ DENIED'}
          </span>
        </div>

        <div className="pt-2 border-t border-gray-700 mt-2">
          <span className="text-gray-400">Current User:</span>{' '}
          <span className="text-cyan-400">{user?.name || 'None'}</span>
        </div>

        <div>
          <span className="text-gray-400">User Access Level:</span>{' '}
          <span className="text-cyan-400">{user?.accessLevel || 'N/A'}</span>
        </div>
      </div>

      {!isString && !hasTypename && (
        <div className="mt-3 p-2 bg-red-900 rounded text-xs">
          <div className="font-bold text-red-300">⚠️ Missing __typename</div>
          <div className="text-red-200 mt-1">
            Object-based permissions require __typename property.
            Either add it or use string type instead.
          </div>
        </div>
      )}
    </div>
  );
}