export default function ArticleSkeleton() {
    return (
        <div className="animate-pulse space-y-8 w-full">
            {/* Title Skeleton */}
            <div className="h-10 bg-gray-200 rounded-md w-3/4 mb-10"></div>

            {/* Content Blocks skeletons */}
            <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded-md w-full"></div>
                <div className="h-4 bg-gray-200 rounded-md w-full"></div>
                <div className="h-4 bg-gray-200 rounded-md w-5/6"></div>
            </div>

            <div className="space-y-4 pt-4">
                <div className="h-6 bg-gray-200 rounded-md w-1/3 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded-md w-full"></div>
                <div className="h-4 bg-gray-200 rounded-md w-4/5"></div>
            </div>

            <div className="space-y-4 pt-4">
                <div className="h-48 bg-gray-200 rounded-xl w-full"></div>
            </div>

            <div className="space-y-4 pt-4">
                <div className="h-4 bg-gray-200 rounded-md w-full"></div>
                <div className="h-4 bg-gray-200 rounded-md w-full"></div>
                <div className="h-4 bg-gray-200 rounded-md w-2/3"></div>
            </div>
        </div>
    );
}
