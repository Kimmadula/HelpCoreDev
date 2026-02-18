import RichTextEditor from "@/Components/RichTextEditor";
import ComponentErrorBoundary from "@/Components/ComponentErrorBoundary";

export default function AddArticleModal({ show, onClose, onAdd, richTextContent, setRichTextContent }) {
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            {/* Backdrop */}
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

            {/* Modal Panel */}
            <div className="relative w-full max-w-4xl max-h-[85vh] bg-white rounded-xl shadow-xl flex flex-col overflow-hidden transform transition-all">

                {/* Header */}
                <div className="flex-shrink-0 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-700">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="bg-white bg-opacity-20 rounded-lg p-2 mr-4">
                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-xl font-bold text-white">Add New Article</h3>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Body (Scrollable) */}
                <div className="flex-1 p-6 overflow-y-auto">
                    <form onSubmit={onAdd}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Article</label>
                                <ComponentErrorBoundary>
                                    <RichTextEditor
                                        value={richTextContent}
                                        onChange={setRichTextContent}
                                    />
                                </ComponentErrorBoundary>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="flex-shrink-0 flex gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onAdd}
                        className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-lg hover:shadow-xl"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Article
                    </button>
                </div>
            </div>
        </div>
    );
}
