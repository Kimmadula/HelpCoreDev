export default function Skeleton({ className = "", count = 1 }) {
    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <div
                    key={index}
                    className={`animate-pulse bg-gray-200 rounded ${className}`}
                >
                    &nbsp;
                </div>
            ))}
        </>
    );
}
