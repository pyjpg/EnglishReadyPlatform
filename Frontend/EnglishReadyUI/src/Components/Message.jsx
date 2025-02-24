export default function Messages() {
    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Left message */}
        <div className="flex items-start gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-full overflow-hidden">
            <img src="/api/placeholder/32/32" alt="Avatar" className="w-full h-full object-cover" />
          </div>
          <div className="bg-gray-900 text-white rounded-2xl p-3 max-w-[80%]">
            <p>Your message goes here</p>
          </div>
        </div>

        {/* Right message */}
        <div className="flex items-start justify-end gap-2">
          <div className="bg-blue-500 text-white rounded-2xl p-3 max-w-[80%]">
            <p>Your message goes here</p>
          </div>
          <div className="w-8 h-8 bg-pink-500 rounded-full overflow-hidden">
            <img src="/api/placeholder/32/32" alt="Avatar" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    )
}