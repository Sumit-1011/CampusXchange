const Shimmer = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array(8)
        .fill(0)
        .map((_, index) => (
          <div
            key={index}
            className="bg-white p-4 rounded shadow-md animate-pulse"
          >
            {/* Image placeholder */}
            <div className="bg-gray-300 h-32 w-full rounded mb-4"></div>

            {/* Title placeholder */}
            <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>

            {/* Usage Date placeholder */}
            <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>

            {/* Price placeholder */}
            <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>

            {/* Posted By placeholder */}
            <div className="h-4 bg-gray-300 rounded w-1/3"></div>
          </div>
        ))}
    </div>
  );
};

export default Shimmer;
