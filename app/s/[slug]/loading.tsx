export default function StructureLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="space-y-3 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[#3A7BD5] border-t-transparent" />
        <p className="text-sm font-medium text-gray-600">Loading…</p>
      </div>
    </div>
  );
}

