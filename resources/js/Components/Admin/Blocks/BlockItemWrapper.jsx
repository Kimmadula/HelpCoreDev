import { useState, useEffect } from "react";
import { HeadingEditor, ParagraphEditor, ImageEditor, ListEditor, RichTextBlocksEditor } from "./BlockEditors";

export default function BlockItemWrapper({ block, onDelete, onUpdate }) {
    const [localText, setLocalText] = useState(block.text ?? "");
    const [localImageWidth, setLocalImageWidth] = useState(block.image_width ?? "md");
    const [localHeadingLevel, setLocalHeadingLevel] = useState(block.heading_level ?? 2);
    const [isDirty, setIsDirty] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setLocalText(block.text ?? "");
        setLocalImageWidth(block.image_width ?? "md");
        setLocalHeadingLevel(block.heading_level ?? 2);
        setIsDirty(false);
    }, [block.text, block.image_width, block.heading_level]);

    const handleSave = async () => {
        setIsSaving(true);
        await onUpdate(block.id, {
            text: localText,
            image_width: localImageWidth,
            heading_level: localHeadingLevel
        });
        setIsDirty(false);
        setIsSaving(false);
    };

    const getBlockTypeIcon = () => {
        switch (block.type) {
            case 'heading':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                );
            case 'paragraph':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                );
            case 'richtext':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                );
            case 'image':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                );
            case 'list':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                );
            default:
                return null;
        }
    };

    const handleTextChange = (newText) => {
        setLocalText(newText);
        setIsDirty(newText !== (block.text ?? ""));
    };

    const handleHeadingLevelChange = (newLevel) => {
        setLocalHeadingLevel(newLevel);
        setIsDirty(newLevel !== (block.heading_level ?? 2) || localText !== (block.text ?? ""));
    };

    const handleImageWidthChange = (newWidth) => {
        setLocalImageWidth(newWidth);
        setIsDirty(newWidth !== (block.image_width ?? "md"));
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm transition-all mb-6">
            {/* Header */}
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white">
                        {getBlockTypeIcon()}
                    </div>
                    <h4 className="text-sm font-semibold text-gray-900">
                        {block.type === 'richtext' ? 'Content Editor' : block.type}
                    </h4>
                    {isDirty && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-orange-100 text-orange-700">
                            Unsaved Changes
                        </span>
                    )}
                </div>
                <button
                    type="button"
                    onClick={() => onDelete(block.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors p-1"
                    title="Delete Block"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>

            {/* Content - Always Visible */}
            <div className="p-4 space-y-4">
                {/* Alignment Controls (except for richtext) */}
                {block.type !== 'richtext' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Alignment</label>
                        <div className="flex gap-2">
                            {['left', 'center', 'right'].map(align => (
                                <button
                                    key={align}
                                    type="button"
                                    onClick={() => onUpdate(block.id, { align })}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${block.align === align
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    {align}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Specific Editor based on type */}
                {block.type === "heading" && (
                    <HeadingEditor
                        localHeadingLevel={localHeadingLevel}
                        onChangeLevel={handleHeadingLevelChange}
                        localText={localText}
                        onChangeText={handleTextChange}
                    />
                )}

                {block.type === "paragraph" && (
                    <ParagraphEditor
                        localText={localText}
                        onChange={handleTextChange}
                    />
                )}

                {block.type === "richtext" && (
                    <RichTextBlocksEditor
                        localText={localText}
                        onChange={handleTextChange}
                        handleSave={handleSave}
                        isSaving={isSaving}
                        isDirty={isDirty}
                    />
                )}

                {block.type === "image" && (
                    <ImageEditor
                        block={block}
                        localImageWidth={localImageWidth}
                        onChangeWidth={handleImageWidthChange}
                    />
                )}

                {block.type === "list" && (
                    <ListEditor block={block} onUpdate={onUpdate} />
                )}

                {/* Save Button (Hidden for RichText) */}
                {block.type !== "richtext" && (
                    <div className="flex justify-end pt-2 border-t border-gray-100 mt-4">
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={!isDirty || isSaving}
                            className={`inline-flex items-center px-6 py-2.5 rounded-lg font-medium text-sm transition-all ${isDirty
                                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            {isSaving ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    Save
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
