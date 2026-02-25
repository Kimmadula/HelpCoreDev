import { useEffect, useState } from "react";

export default function TableOfContents({ toc, activeId }) {
    if (!toc || toc.length === 0) return null;

    return (
        <aside className="toc-sidebar hidden xl:block w-64 flex-shrink-0 pt-8 pr-8 pb-12 sticky top-8 max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="toc-container">
                <h4 className="text-xs font-semibold text-gray-500 tracking-wider mb-4">ON THIS PAGE</h4>
                <nav className="flex flex-col gap-2 border-l border-gray-200">
                    {toc.map((item) => (
                        <a
                            key={item.id}
                            href={`#${item.id}`}
                            className={`text-sm py-1 transition-colors border-l-2 -ml-[1px]
                                ${item.level === 3 ? 'pl-6 text-gray-500 text-[13px]' : 'pl-4 text-gray-600'}
                                ${activeId === item.id
                                    ? 'border-[#FF6C00] text-[#FF6C00] font-medium'
                                    : 'border-transparent hover:border-gray-300 hover:text-gray-900'
                                }
                            `}
                            onClick={(e) => {
                                e.preventDefault();
                                document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                            }}
                        >
                            {item.text}
                        </a>
                    ))}
                </nav>
            </div>
        </aside>
    );
}
