export default function IncidentsLoading() {
  return (
    <div className="w-full max-w-full animate-pulse">
      <div className="flex justify-between items-center mb-6">
        <div className="h-8 w-64 bg-gray-300 rounded"></div>
        <div className="h-10 w-32 bg-gray-300 rounded-lg"></div>
      </div>
      <div className="h-10 w-full bg-gray-200 rounded-lg mb-6"></div>
      <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
        <div className="h-10 bg-gray-200 rounded mb-4"></div>
        <div className="h-16 bg-gray-100 rounded mb-2"></div>
        <div className="h-16 bg-gray-100 rounded mb-2"></div>
        <div className="h-16 bg-gray-100 rounded mb-2"></div>
      </div>
    </div>
  )
}