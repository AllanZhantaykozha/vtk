export function DeadlineCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl w-[250px] h-[180px] p-4 flex flex-col justify-between animate-pulse">
      <div className="flex flex-col gap-3">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
      </div>
      <div className="h-8 bg-gray-200 rounded w-full mt-4"></div>
    </div>
  );
}
