import RichTextEditor from "@/Components/RichTextEditor";
import ComponentErrorBoundary from "@/Components/ComponentErrorBoundary";
import { getYouTubeId, getImageUrl } from "@/Utils/articleContent";

export function HeadingEditor({ localHeadingLevel, setLocalHeadingLevel, localText, setLocalText, setIsDirty }) {
    return (
        <div className="space-y-3">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Heading Level</label>
                <div className="flex gap-2">
                    {[2, 3].map(lvl => (
                        <button
                            key={lvl}
                            onClick={() => { setLocalHeadingLevel(lvl); setIsDirty(true); }}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${localHeadingLevel === lvl
                                ? 'bg-gray-800 text-white'
                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            H{lvl}
                        </button>
                    ))}
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Heading Text</label>
                <input
                    type="text"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={localText}
                    onChange={(e) => { setLocalText(e.target.value); setIsDirty(true); }}
                    placeholder="Enter heading text"
                />
            </div>
        </div>
    );
}

export function ParagraphEditor({ localText, setLocalText, setIsDirty }) {
    return (
        <div className="space-y-3">
            {(() => {
                const ytId = getYouTubeId(localText?.trim() ?? "");
                if (ytId) {
                    return (
                        <div className="mb-3 rounded-lg overflow-hidden border border-gray-200 bg-gray-900 aspect-video relative">
                            <iframe
                                src={`https://www.youtube.com/embed/${ytId}`}
                                className="absolute inset-0 w-full h-full"
                                frameBorder="0"
                                allowFullScreen
                            />
                        </div>
                    );
                }
            })()}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Paragraph Content</label>
                <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-y min-h-[120px]"
                    value={localText}
                    onChange={(e) => { setLocalText(e.target.value); setIsDirty(true); }}
                    placeholder="Write your content here..."
                />
                <p className="text-xs text-gray-500 mt-1">Markdown supported</p>
            </div>
        </div>
    );
}

export function ImageEditor({ block, localImageWidth, setLocalImageWidth, setIsDirty }) {
    return (
        <div className="space-y-3">
            {block.image_path && (
                <div className="rounded-lg border border-gray-200 overflow-hidden bg-gray-50 p-4">
                    <img
                        src={getImageUrl(block.image_path)}
                        className="max-w-full h-auto rounded-lg"
                        alt="Block image"
                    />
                </div>
            )}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image Path</label>
                <input
                    type="text"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
                    value={block.image_path ?? ""}
                    readOnly
                    placeholder="Image path"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image Width</label>
                <div className="flex gap-2">
                    {['sm', 'md', 'lg', 'full'].map(w => (
                        <button
                            key={w}
                            onClick={() => { setLocalImageWidth(w); setIsDirty(true); }}
                            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${localImageWidth === w
                                ? 'bg-blue-600 text-white'
                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            {w}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

export function ListEditor({ block, onUpdate }) {
    return (
        <div className="space-y-3">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">List Style</label>
                <div className="flex gap-2">
                    {['bullet', 'number'].map(s => (
                        <button
                            key={s}
                            onClick={() => onUpdate(block.id, { list_style: s })}
                            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${block.list_style === s
                                ? 'bg-gray-800 text-white'
                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            {s}s
                        </button>
                    ))}
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">List Items (one per line)</label>
                <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono text-sm resize-y min-h-[150px]"
                    value={Array.isArray(block.list_items) ? block.list_items.join("\n") : (block.list_items ?? "")}
                    onChange={(e) => onUpdate(block.id, { list_items: e.target.value.split("\n") })}
                    placeholder="Enter list items..."
                />
            </div>
        </div>
    );
}

export function RichTextBlocksEditor({ localText, setLocalText, setIsDirty, handleSave, isSaving, isDirty }) {
    return (
        <div>
            <ComponentErrorBoundary>
                <RichTextEditor
                    value={localText}
                    onChange={(html) => { setLocalText(html); setIsDirty(true); }}
                    onSave={handleSave}
                    isSaving={isSaving}
                    isDirty={isDirty}
                />
            </ComponentErrorBoundary>
        </div>
    );
}
