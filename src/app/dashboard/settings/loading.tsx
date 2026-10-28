export default function UserManagementLoading() {
  return (
    <div className="max-w-7xl mx-auto pb-10 animate-pulse">
      
      {/* Header Skeleton */}
      <div className="mb-8">
        <div className="h-4 w-32 bg-gray-200 rounded mb-4"></div>
        <div className="h-8 w-64 bg-gray-300 rounded mb-2"></div>
        <div className="h-4 w-96 bg-gray-200 rounded"></div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Table Skeleton */}
        <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="h-6 w-32 bg-gray-300 rounded"></div>
            <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
          </div>
          <div className="space-y-4">
            <div className="h-16 bg-gray-100 rounded-lg"></div>
            <div className="h-16 bg-gray-100 rounded-lg"></div>
            <div className="h-16 bg-gray-100 rounded-lg"></div>
          </div>
        </div>

        {/* Form Skeleton */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
          <div className="h-6 w-40 bg-gray-300 rounded mb-6"></div>
          <div className="space-y-4">
            <div className="h-10 bg-gray-100 rounded-lg"></div>
            <div className="h-10 bg-gray-100 rounded-lg"></div>
            <div className="flex gap-2">
              <div className="h-10 w-1/2 bg-gray-100 rounded-lg"></div>
              <div className="h-10 w-1/2 bg-gray-100 rounded-lg"></div>
            </div>
            <div className="h-10 bg-gray-100 rounded-lg"></div>
            <div className="h-10 bg-gray-200 rounded-lg mt-6"></div>
          </div>
        </div>

      </div>
    </div>
  )
}