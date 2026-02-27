export default function TableSkeleton({ rows = 5, columns = 4 }) {
    return (
        <>
            {Array.from({ length: rows }).map((_, i) => (
                <tr key={i} className="animate-pulse hover:bg-gray-50 transition-colors">
                    {Array.from({ length: columns }).map((_, j) => (
                        <td key={j} className="px-6 py-4 whitespace-nowrap">
                            <div className="h-4 bg-gray-200 rounded-md w-3/4"></div>
                        </td>
                    ))}
                </tr>
            ))}
        </>
    );
}
