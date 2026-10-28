export default function SettingsLoading() {
  return (
    <div className="max-w-6xl mx-auto pb-10 animate-pulse">
      
      {/* Page Header Skeleton */}
      <div className="mb-8">
        <div className="h-8 w-64 bg-gray-300 rounded mb-2"></div>
        <div className="h-4 w-96 bg-gray-200 rounded"></div>
      </div>

      {/* My Account Section Skeleton */}
      <div className="mb-12">
        <div className="h-6 w-32 bg-gray-300 rounded mb-4 border-b pb-2"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile Card Skeleton */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-64">
            <div className="h-5 w-32 bg-gray-300 rounded mb-6"></div>
            <div className="space-y-4">
              <div className="h-10 bg-gray-100 rounded-lg"></div>
              <div className="h-10 bg-gray-100 rounded-lg"></div>
              <div className="h-10 bg-gray-100 rounded-lg"></div>
            </div>
          </div>
          {/* Password Card Skeleton */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-64">
            <div className="h-5 w-40 bg-gray-300 rounded mb-6"></div>
            <div className="space-y-4">
              <div className="h-10 bg-gray-100 rounded-lg"></div>
              <div className="h-10 w-32 bg-gray-200 rounded-lg mt-4"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Configurations Skeleton */}
      <div>
        <div className="h-6 w-48 bg-gray-300 rounded mb-4 border-b pb-2"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="h-40 bg-gray-200 rounded-xl"></div>
          <div className="h-64 bg-gray-200 rounded-xl"></div>
          <div className="h-64 bg-gray-200 rounded-xl"></div>
        </div>
      </div>

    </div>
  )
}