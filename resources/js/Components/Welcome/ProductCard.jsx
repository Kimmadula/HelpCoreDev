export function ProductIcon({ className = "" }) {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
        </svg>
    );
}

export default function ProductCard({ product, index }) {
    return (
        <a
            href={`/help/${product.slug}`}
            className="product-card group relative block"
            style={{ animationDelay: `${index * 0.05}s` }}
        >
            <div className="glass-card relative p-6 rounded-xl h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/20 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                {/* Icon */}
                <div className="relative mb-4">
                    <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-300">
                        <span className="text-white font-bold text-lg">
                            {product.name.charAt(0).toUpperCase()}
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="relative">
                    <h3 className="font-semibold text-base text-gray-900 group-hover:text-orange-600 transition-colors duration-300">
                        {product.name}
                    </h3>
                </div>

                {/* Arrow indicator */}
                <div className="absolute bottom-4 right-4 w-6 h-6 rounded-full bg-orange-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <svg className="w-3 h-3 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            </div>
        </a>
    );
}
