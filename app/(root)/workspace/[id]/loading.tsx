export default function Loading() {
  return (
    <div className="h-full flex flex-col">
      <header className="border-b p-4 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 bg-gray-200 rounded animate-pulse w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
          </div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
        </div>
      </header>
      
      <div className="flex-1 p-4">
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
        </div>
      </div>
    </div>
  );
}
