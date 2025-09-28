import { CardSkeleton } from "@/components/general/loadingSkeletons";

export default function TasksPageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
        <div className="h-4 w-96 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>
      <div className="space-y-8">
        <CardSkeleton count={1} />
        <CardSkeleton count={3} />
        <CardSkeleton count={3} />
        <CardSkeleton count={3} />
      </div>
    </div>
  );
}
