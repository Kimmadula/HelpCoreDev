export default function SearchSuggestionItem({ result, onNavigate }) {
    const iconConfig = {
        product: {
            bgColor: "bg-orange-100",
            textColor: "text-orange-600",
            borderColor: "border-orange-100",
            label: "PRODUCT",
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                </svg>
            ),
        },
        section: {
            bgColor: "bg-purple-100",
            textColor: "text-purple-600",
            borderColor: "border-purple-100",
            label: "SECTION",
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
            ),
        },
        subsection: {
            bgColor: "bg-blue-100",
            textColor: "text-blue-600",
            borderColor: "border-blue-100",
            label: "ARTICLE",
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
            ),
        },
    };

    const config = iconConfig[result.type] || iconConfig.subsection;

    return (
        <a
            href={result.url}
            onClick={onNavigate}
            className="flex items-center gap-4 px-6 py-4 hover:bg-orange-50 transition-colors border-b border-gray-50 last:border-0 group/item"
            role="option"
        >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${config.bgColor} ${config.textColor}`}>
                {config.icon}
            </div>
            <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${config.bgColor} ${config.textColor} ${config.borderColor}`}>
                        {config.label}
                    </span>
                </div>
                <div className="font-medium text-gray-900 group-hover/item:text-orange-600 transition-colors truncate">
                    {result.title}
                </div>
                {(result.type === 'subsection' || result.type === 'section') && (
                    <div className="text-xs text-gray-500 mt-0.5 truncate">
                        in {result.product_name}
                    </div>
                )}
            </div>
            <svg className="w-4 h-4 text-gray-300 group-hover/item:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
        </a>
    );
}
