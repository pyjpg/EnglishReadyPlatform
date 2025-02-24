export default function Header() {
    return (
        <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">IELTS Writing - Task 1 - Question 3/6</h1>
          <div className="relative w-16 h-16">
            <div className="w-16 h-16 rounded-full bg-gray-200">
              <div 
                className="absolute inset-0 rounded-full border-4 border-blue-500"
                style={{
                  clipPath: 'polygon(0 0, 65% 0, 65% 100%, 0 100%)'
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-medium">65%</span>
              </div>
            </div>
          </div>
        </div>
        {/* Progress dots */}
        <div className="flex gap-2 mt-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full ${
                i < 3 ? 'bg-purple-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    )
}