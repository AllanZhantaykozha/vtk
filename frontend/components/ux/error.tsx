export function Error(error: any) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-red-600">{error}</p>
    </div>
  );
}
