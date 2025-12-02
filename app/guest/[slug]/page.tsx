type Params = Promise<{
  slug: string;
}>;

export default async function GuestPage({ params }: { params: Params }) {
  const { slug } = await params;

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">Guest page</h1>
        <p className="text-lg text-gray-600">Structure slug: {slug}</p>
      </div>
    </div>
  );
}
