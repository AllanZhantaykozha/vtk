export function HeaderSkeleton() {
  return (
    <div className="w-full h-fit px-3 py-2 flex justify-between items-center">
      <div className="font-bold text-4xl">
        <div className="h-10 w-48 bg-slate-400 rounded animate-pulse"></div>
      </div>

      <div className="flex gap-10 items-center">
        <div className="flex items-center gap-3">
          <div className="w-13 h-13 bg-slate-400 rounded-full animate-pulse"></div>
          <div className="font-semibold text-lg">
            <div className="h-5 w-20 bg-slate-400 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="bg-slate-400 p-3 rounded-full cursor-pointer animate-pulse w-13 h-13"></div>
      </div>
    </div>
  );
}
