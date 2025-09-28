import { CardSkeleton } from "@/components/general/loadingSkeletons";

export default function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
        <div className="h-4 w-96 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg p-6">
            <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
            <div className="h-8 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        ))}
      </div>
      <CardSkeleton count={6} />
    </div>
  );
}
