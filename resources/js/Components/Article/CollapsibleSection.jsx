import { useState, useEffect } from "react";

export default function CollapsibleSection({ section, activeSubsectionId, onSubsectionClick }) {
    const hasActiveChild = section.subsections?.some(ss => ss.id === activeSubsectionId);
    const [isOpen, setIsOpen] = useState(hasActiveChild);

    useEffect(() => {
        if (hasActiveChild) setIsOpen(true);
    }, [hasActiveChild]);

    return (
        <div className="section-group">
            <button
                className="w-full flex items-center justify-between text-left group cursor-pointer"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="section-title mb-0 group-hover:text-gray-600 transition-colors">
                    {section.title}
                </div>
                <svg
                    className={`w-3 h-3 text-gray-400 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[1000px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}
            >
                <div className="subsection-nav">
                    {section.subsections?.map((ss) => (
                        <button
                            key={ss.id}
                            onClick={() => onSubsectionClick(ss.id)}
                            className={`subsection-btn ${activeSubsectionId === ss.id ? "active" : ""}`}
                        >
                            {ss.title}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
