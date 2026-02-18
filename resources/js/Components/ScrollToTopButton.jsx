
export default function ScrollToTopButton({ show, onClick }) {
    if (!show) return null;

    return (
        <button
            onClick={onClick}
            className="fixed bottom-20 right-8 p-3 bg-[#FF6C00] text-white rounded-full shadow-lg hover:bg-[#ff8c3a] transition-all transform hover:scale-110 z-50 group"
            title="Back to top"
        >
            <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
            </svg>
        </button>
    );
}
