import { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import textAlign from '@tiptap/extension-text-align';
import Youtube from '@tiptap/extension-youtube';
import Image from '@tiptap/extension-image';
import { Extension } from '@tiptap/core';
import axios from 'axios';
import Link from '@tiptap/extension-link';
import ColorPicker from './ColorPicker';

const TabExtension = Extension.create({
    name: 'tabHandler',

    addKeyboardShortcuts() {
        return {
            Tab: () => {
                if (this.editor.can().sinkListItem('listItem')) {
                    return this.editor.commands.sinkListItem('listItem');
                }
                this.editor.commands.insertContent('\u00A0\u00A0\u00A0\u00A0');
                return true;
            },
            'Shift-Tab': () => {
                if (this.editor.can().liftListItem('listItem')) {
                    return this.editor.commands.liftListItem('listItem');
                }
                return false;
            },
        };
    },
});

const uploadImage = async (file, view) => {
    // 2MB limit
    if (file.size > 2 * 1024 * 1024) {
        alert("Image size exceeds the 2MB limit.");
        return false;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
        const res = await axios.post("/api/admin/uploads/images", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        if (res.data && res.data.path) {
            const url = (res.data.path.startsWith('http') || res.data.path.startsWith('/storage'))
                ? res.data.path
                : `/storage/${res.data.path}`;

            const node = view.state.schema.nodes.image.create({ src: url });
            const transaction = view.state.tr.replaceSelectionWith(node);
            view.dispatch(transaction);
            return true;
        }
    } catch (error) {
        console.error("Image upload failed:", error);
        alert("Failed to upload image. Please try again.");
    }
    return false;
};

const MenuBar = ({ editor, onSave, isSaving, isDirty }) => {
    const fileInputRef = useRef(null);

    if (!editor) {
        return null;
    }

    const addYoutubeVideo = () => {
        const url = prompt('Enter YouTube URL');

        if (url) {
            editor.commands.setYoutubeVideo({
                src: url,
                width: 640,
                height: 480,
            })
        }
    }

    const triggerImageUpload = () => {
        fileInputRef.current?.click();
    };

    const handleImageChange = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        await uploadImage(file, editor.view);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const buttonClass = (isActive) =>
        `p-1.5 rounded transition ${isActive
            ? 'bg-gray-800 text-white'
            : 'text-gray-600 hover:bg-gray-200'
        }`;

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
                        type="button"
                    >
                        <strong>B</strong>
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        disabled={!editor.can().chain().focus().toggleItalic().run()}
                        className={buttonClass(editor.isActive('italic'))}
                        title="Italic"
                        type="button"
                    >
                        <em>I</em>
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        className={buttonClass(editor.isActive('underline'))}
                        title="Underline"
                        type="button"
                    >
                        <u>U</u>
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        className={buttonClass(editor.isActive('strike'))}
                        title="Strikethrough"
                        type="button"
                    >
                        <s>S</s>
                    </button>
                </div>

                <div className="flex gap-1 px-2 border-r border-gray-300">
                    <button
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        className={buttonClass(editor.isActive('heading', { level: 2 }))}
                        title="Heading 2"
                        type="button"
                    >
                        H2
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                        className={buttonClass(editor.isActive('heading', { level: 3 }))}
                        title="Heading 3"
                        type="button"
                    >
                        H3
                    </button>
                </div>

                <div className="flex gap-1 px-2 border-r border-gray-300">
                    <button
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        className={buttonClass(editor.isActive('bulletList'))}
                        title="Bullet List"
                        type="button"
                    >
                        • List
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        className={buttonClass(editor.isActive('orderedList'))}
                        title="Ordered List"
                        type="button"
                    >
                        1. List
                    </button>
                </div>

                <div className="flex gap-1 px-2 border-r border-gray-300">
                    <button
                        onClick={() => editor.chain().focus().setTextAlign('left').run()}
                        className={buttonClass(editor.isActive({ textAlign: 'left' }))}
                        title="Left"
                        type="button"
                    >
                        Left
                    </button>
                    <button
                        onClick={() => editor.chain().focus().setTextAlign('center').run()}
                        className={buttonClass(editor.isActive({ textAlign: 'center' }))}
                        title="Center"
                        type="button"
                    >
                        Center
                    </button>
                    <button
                        onClick={() => editor.chain().focus().setTextAlign('right').run()}
                        className={buttonClass(editor.isActive({ textAlign: 'right' }))}
                        title="Right"
                        type="button"
                    >
                        Right
                    </button>
                    <button
                        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                        className={buttonClass(editor.isActive({ textAlign: 'justify' }))}
                        title="Justify"
                        type="button"
                    >
                        Justify
                    </button>
                </div>


                <div className="flex gap-1 px-2 border-r border-gray-300">
                    <button
                        onClick={addYoutubeVideo}
                        className={buttonClass(editor.isActive('youtube'))}
                        title="Add Video"
                        type="button"
                    >
                        ▶ Video
                    </button>
                    <button
                        onClick={triggerImageUpload}
                        className={buttonClass(editor.isActive('image'))}
                        title="Add Image"
                        type="button"
                    >
                        🖼 Image
                    </button>
                </div>

                <div className="flex gap-1 px-2">
                    <ColorPicker editor={editor} />
                </div>
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
};

export default function RichTextEditor({ value, onChange, onSave, isSaving, isDirty }) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            TextStyle,
            Color,
            textAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Youtube.configure({
                controls: false,
            }),
            Image.configure({
                inline: true,
            }),
            Link.configure({
                openOnClick: false,
                autolink: true,
            }),
            TabExtension, // Add the custom tab extension
        ],
        content: value,
        editorProps: {
            attributes: {
                class: 'prose max-w-none focus:outline-none min-h-[400px] p-4 bg-white rounded-b-lg'
            },
            handlePaste: (view, event, slice) => {
                const items = event.clipboardData?.items;
                if (items) {
                    for (const item of items) {
                        if (item.type.startsWith("image")) {
                            event.preventDefault();
                            const file = item.getAsFile();
                            if (file) {
                                uploadImage(file, view);
                                return true;
                            }
                        }
                    }
                }
                return false;
            },
            handleDrop: (view, event, slice, moved) => {
                if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
                    const file = event.dataTransfer.files[0];
                    if (file.type.startsWith("image")) {
                        event.preventDefault();
                        uploadImage(file, view);
                        return true;
                    }
                }
                return false;
            }
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    useEffect(() => {
        if (editor && value === "") {
            editor.commands.clearContent();
        }
    }, [editor, value]);

    return (
        <div className="border border-gray-200 rounded-lg shadow-sm bg-white">
            <MenuBar editor={editor} onSave={onSave} isSaving={isSaving} isDirty={isDirty} />
            <EditorContent editor={editor} />
            <style>{`
                .ProseMirror p { margin-bottom: 0.5em; }
                .ProseMirror h2 { margin-top: 1em; margin-bottom: 0.5em; font-weight: bold; font-size: 1.5em; }
                .ProseMirror h3 { margin-top: 0.8em; margin-bottom: 0.4em; font-weight: bold; font-size: 1.25em; }
                .ProseMirror ul { list-style-type: disc; padding-left: 1.5em; margin-bottom: 0.5em; }
                .ProseMirror ol { list-style-type: decimal; padding-left: 1.5em; margin-bottom: 0.5em; }
                .ProseMirror blockquote { border-left: 3px solid #ccc; padding-left: 1em; color: #666; font-style: italic; }
                .ProseMirror a { color: #2563eb; text-decoration: underline; cursor: pointer; }
                .ProseMirror { white-space: pre-wrap; }
                .ProseMirror ul ul { list-style-type: circle; }
                .ProseMirror ul ul ul { list-style-type: square; }
            `}</style>
        </div>
    );
}