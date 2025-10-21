export function CreateListSkeleton() {
  return (
    <div className="rounded-4xl w-full h-[600px] bg-white animate-pulse"></div>
  );
}

export function CreateIslandSkeleton({ title }: { title: string }) {
  return (
    <div className="p-3 ">
      <h1 className="text-3xl font-bold mb-4 text-center">{title}</h1>
      <div className="grid grid-cols-[1fr_2fr] gap-5">
        <div className="rounded-3xl w-full h-[600px] bg-white animate-pulse"></div>
        <div className="rounded-3xl w-full h-[600px] bg-white animate-pulse"></div>
      </div>
    </div>
  );
}
