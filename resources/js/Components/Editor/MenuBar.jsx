import { useRef, useCallback, memo } from 'react';
import ColorPicker from '../ColorPicker';

const buttonClass = (isActive) =>
    `p-1.5 rounded transition ${isActive
        ? 'bg-gray-800 text-white'
        : 'text-gray-600 hover:bg-gray-200'
    }`;

const MenuBar = memo(({ editor, onSave, isSaving, isDirty, isUploading, onImageUpload }) => {
    const fileInputRef = useRef(null);

    if (!editor) {
        return null;
    }

    const setLink = useCallback(() => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);

        // cancelled
        if (url === null) {
            return;
        }

        // empty
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        // update
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }, [editor]);

    const triggerImageUpload = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleImageChange = useCallback(async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (onImageUpload) {
            await onImageUpload(file, editor.view);
        }

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }, [editor, onImageUpload]);

    return (
        <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 bg-white rounded-t-lg sticky top-0 z-20 items-center justify-between">
            <div className="flex flex-wrap gap-1 items-center">
                {/* Hidden File Input */}
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                />

                <div className="flex gap-1 pr-2 border-r border-gray-300">
                    <button
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        disabled={!editor.can().chain().focus().toggleBold().run()}
                        className={buttonClass(editor.isActive('bold'))}
                        title="Bold"
                        aria-label="Bold"
                        aria-pressed={editor.isActive('bold')}
                        type="button">
                        <strong>B</strong>
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        disabled={!editor.can().chain().focus().toggleItalic().run()}
                        className={buttonClass(editor.isActive('italic'))}
                        title="Italic"
                        aria-label="Italic"
                        aria-pressed={editor.isActive('italic')}
                        type="button">
                        <em>I</em>
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        className={buttonClass(editor.isActive('underline'))}
                        title="Underline"
                        aria-label="Underline"
                        aria-pressed={editor.isActive('underline')}
                        type="button">
                        <u>U</u>
                    </button>
                    <ColorPicker editor={editor} />
                    <button
                        onClick={setLink}
                        className={buttonClass(editor.isActive('link'))}
                        title="Add Link"
                        aria-label="Add Link"
                        aria-pressed={editor.isActive('link')}
                        type="button">
                        🔗
                    </button>
                    <button
                        onClick={() => editor.chain().focus().unsetLink().run()}
                        disabled={!editor.isActive('link')}
                        className={buttonClass(false)}
                        title="Remove Link"
                        aria-label="Remove Link"
                        type="button">
                        🚫
                    </button>
                </div>

                <div className="flex gap-1 px-2 border-r border-gray-300">
                    {/* Heading Dropdown */}
                    <select
                        onChange={(e) => {
                            const value = e.target.value;
                            if (value === 'paragraph') {
                                editor.chain().focus().setParagraph().run();
                            } else {
                                editor.chain().focus().toggleHeading({ level: parseInt(value) }).run();
                            }
                        }}
                        value={
                            editor.isActive('heading', { level: 1 }) ? '1' :
                                editor.isActive('heading', { level: 2 }) ? '2' :
                                    editor.isActive('heading', { level: 3 }) ? '3' :
                                        editor.isActive('heading', { level: 4 }) ? '4' :
                                            editor.isActive('heading', { level: 5 }) ? '5' :
                                                editor.isActive('heading', { level: 6 }) ? '6' :
                                                    'paragraph'
                        }
                        className="p-1.5 text-sm border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 min-w-[100px]"
                        title="Text Type"
                        aria-label="Text Type">
                        <option value="paragraph">Paragraph</option>
                        <option value="1">Heading 1</option>
                        <option value="2">Heading 2</option>
                        <option value="3">Heading 3</option>
                        <option value="4">Heading 4</option>
                        <option value="5">Heading 5</option>
                        <option value="6">Heading 6</option>
                    </select>

                    {/* Font Family Dropdown */}
                    <select
                        onChange={(e) => {
                            const value = e.target.value;
                            if (value) {
                                editor.chain().focus().setFontFamily(value).run();
                            } else {
                                editor.chain().focus().unsetFontFamily().run();
                            }
                        }}
                        value={editor.getAttributes('textStyle').fontFamily || ''}
                        className="p-1.5 text-sm border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 min-w-[120px]"
                        title="Font Family"
                        aria-label="Font Family">
                        <option value="">Default Font</option>
                        <option value="Inter, sans-serif">Inter</option>
                        <option value="Arial, sans-serif">Arial</option>
                        <option value="Georgia, serif">Georgia</option>
                        <option value="Times New Roman, serif">Times New Roman</option>
                        <option value="Courier New, monospace">Courier New</option>
                    </select>

                    {/* Font Size Dropdown */}
                    <select
                        onChange={(e) => {
                            const value = e.target.value;
                            if (value) {
                                editor.chain().focus().setFontSize(value).run();
                            } else {
                                editor.chain().focus().unsetFontSize().run();
                            }
                        }}
                        value={editor.getAttributes('textStyle').fontSize || ''}
                        className="p-1.5 text-sm border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 w-20"
                        title="Font Size"
                        aria-label="Font Size">
                        <option value="">Size</option>
                        <option value="12">12</option>
                        <option value="14">14</option>
                        <option value="16">16</option>
                        <option value="18">18</option>
                        <option value="20">20</option>
                        <option value="24">24</option>
                        <option value="30">30</option>
                        <option value="36">36</option>
                        <option value="48">48</option>
                        <option value="60">60</option>
                        <option value="72">72</option>
                    </select>

                    <button
                        onClick={() => editor.chain().focus().setTextAlign('left').run()}
                        className={buttonClass(editor.isActive({ textAlign: 'left' }) || !editor.getAttributes('paragraph').textAlign)}
                        title="Align Left"
                        aria-label="Align Left"
                        aria-pressed={editor.isActive({ textAlign: 'left' }) || !editor.getAttributes('paragraph').textAlign}
                        type="button">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h16" />
                        </svg>
                    </button>
                    <button
                        onClick={() => editor.chain().focus().setTextAlign('center').run()}
                        className={buttonClass(editor.isActive({ textAlign: 'center' }))}
                        title="Align Center"
                        aria-label="Align Center"
                        aria-pressed={editor.isActive({ textAlign: 'center' })}
                        type="button">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M7 12h10M7 18h10" />
                        </svg>
                    </button>
                    <button
                        onClick={() => editor.chain().focus().setTextAlign('right').run()}
                        className={buttonClass(editor.isActive({ textAlign: 'right' }))}
                        title="Align Right"
                        aria-label="Align Right"
                        aria-pressed={editor.isActive({ textAlign: 'right' })}
                        type="button">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M10 12h10M4 18h16" />
                        </svg>
                    </button>
                    <button
                        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                        className={buttonClass(editor.isActive({ textAlign: 'justify' }))}
                        title="Justify"
                        aria-label="Justify"
                        aria-pressed={editor.isActive({ textAlign: 'justify' })}
                        type="button">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>

                <div className="flex gap-1 px-2 border-r border-gray-300">
                    <button
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        className={buttonClass(editor.isActive('bulletList'))}
                        title="Bullet List"
                        aria-label="Bullet List"
                        aria-pressed={editor.isActive('bulletList')}
                        type="button">
                        • List
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        className={buttonClass(editor.isActive('orderedList'))}
                        title="Ordered List"
                        aria-label="Ordered List"
                        aria-pressed={editor.isActive('orderedList')}
                        type="button">
                        1. List
                    </button>
                </div>

                <button
                    onClick={triggerImageUpload}
                    className={buttonClass(editor.isActive('image'))}
                    title="Add Image"
                    aria-label="Add Image"
                    disabled={isUploading}
                    type="button"
                >
                    {isUploading ? '...' : '🖼'}
                </button>

            </div>

            {/* Save Button in Toolbar */}
            {onSave && (
                <button
                    type="button"
                    onClick={onSave}
                    disabled={!isDirty || isSaving}
                    className={`ml-auto inline-flex items-center px-3 py-1.5 text-sm font-medium rounded transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${isDirty && !isSaving
                        ? 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                        : 'bg-gray-100 text-gray-400'
                        }`}
                >
                    {isSaving ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                        </>
                    ) : (
                        <>
                            <svg className={`w-4 h-4 mr-1.5 ${isDirty ? 'text-white' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                            </svg>
                            Save
                        </>
                    )}
                </button>
            )}
        </div>
    );
});

export default MenuBar;
