export default function RecapLoading() {
  return (
    <div className="w-full max-w-7xl mx-auto animate-pulse">
      <div className="flex justify-between items-center mb-6">
        <div className="h-8 w-64 bg-gray-300 rounded"></div>
        <div className="h-10 w-48 bg-gray-300 rounded-lg"></div>
      </div>
      <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    </div>
  )
}