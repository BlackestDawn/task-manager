'use client';

interface SkeletonProps {
  className?: string;
  count?: number;
}

function SkeletonLine({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />
  );
}

export function ListSkeleton({ count = 3 }: SkeletonProps) {
  return (
    <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {Array.from({ length: count }, (_, i) => (
          <li key={i} className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <SkeletonLine className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <SkeletonLine className="h-4 w-32" />
                  <SkeletonLine className="h-3 w-48" />
                  <SkeletonLine className="h-3 w-24" />
                </div>
              </div>
              <div className="flex space-x-2">
                <SkeletonLine className="h-8 w-8 rounded-full" />
                <SkeletonLine className="h-8 w-8 rounded-full" />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CardSkeleton({ count = 6 }: SkeletonProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <SkeletonLine className="h-6 w-32" />
              <SkeletonLine className="h-8 w-8 rounded-full" />
            </div>
            <SkeletonLine className="h-4 w-full mb-2" />
            <SkeletonLine className="h-4 w-3/4 mb-4" />
            <div className="flex items-center justify-between text-sm">
              <SkeletonLine className="h-4 w-20" />
              <SkeletonLine className="h-4 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function DetailsSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <div className="flex items-center space-x-3">
          <SkeletonLine className="h-8 w-8 rounded" />
          <div>
            <SkeletonLine className="h-6 w-48 mb-2" />
            <SkeletonLine className="h-4 w-64" />
          </div>
        </div>
      </div>
      <div className="border-t border-gray-200 dark:border-gray-700">
        <dl>
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className={`px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 ${
              i % 2 === 0 ? 'bg-gray-50 dark:bg-gray-700' : 'bg-white dark:bg-gray-800'
            }`}>
              <dt className="text-sm font-medium">
                <SkeletonLine className="h-4 w-24" />
              </dt>
              <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                <SkeletonLine className="h-4 w-36" />
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
