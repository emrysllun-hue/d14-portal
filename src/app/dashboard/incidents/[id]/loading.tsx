export default function LoadingIncident() {
  return (
    <div className="max-w-5xl mx-auto pb-10 animate-pulse">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <div className="h-4 w-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-8 w-64 bg-gray-300 rounded"></div>
        </div>
        <div className="h-8 w-24 bg-gray-200 rounded-full"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
            <div className="h-4 w-24 bg-gray-200 rounded mb-3"></div>
            <div className="w-full h-64 bg-gray-200 rounded-md"></div>
          </div>
        </div>
        <div className="md:col-span-2 bg-white p-6 rounded-lg shadow border border-gray-100">
          <div className="h-6 w-48 bg-gray-300 rounded mb-6"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-4 w-20 bg-gray-200 rounded"></div>
            <div className="h-4 w-32 bg-gray-200 rounded"></div>
            <div className="h-4 w-20 bg-gray-200 rounded"></div>
            <div className="h-4 w-40 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  )
}