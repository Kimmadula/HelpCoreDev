import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import FontFamily from '@tiptap/extension-font-family';
import textAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import DOMPurify from 'dompurify';

import '../../css/editor.css';

// Extensions
import { FontSize } from '../Extensions/FontSize';
import { IndentationExtension } from '../Extensions/Indentation';

// Components
import MenuBar from './Editor/MenuBar';

// Hooks
import { useImageUpload } from '../Hooks/useImageUpload';

export default function RichTextEditor({ value, onChange, onSave, isSaving, isDirty }) {
    const { isUploading, onImageUpload } = useImageUpload();

    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            TextStyle,
            Color,
            FontFamily,
            FontSize,
            textAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Image.configure({
                inline: true,
            }),
            Link.configure({
                openOnClick: false,
                autolink: true,
            }),
            IndentationExtension,
        ],
        content: value,
        editorProps: {
            attributes: {
                class: 'prose max-w-none focus:outline-none min-h-[400px] p-4 bg-white rounded-b-lg whitespace-pre-wrap'
            },
            handlePaste: (view, event, slice) => {
                const items = event.clipboardData?.items;
                if (items) {
                    for (const item of items) {
                        if (item.type.startsWith("image")) {
                            event.preventDefault();
                            const file = item.getAsFile();
                            if (file) {
                                onImageUpload(file, view);
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
                        onImageUpload(file, view);
                        return true;
                    }
                }
                return false;
            }
        },
        onUpdate: ({ editor }) => {
            const cleanContent = DOMPurify.sanitize(editor.getHTML());
            onChange(cleanContent);
        },
    });

    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value, false);
        }
    }, [editor, value]);

    return (
        <div className="border border-gray-200 rounded-lg shadow-sm bg-white">
            <MenuBar
                editor={editor}
                onSave={onSave}
                isSaving={isSaving}
                isDirty={isDirty}
                isUploading={isUploading}
                onImageUpload={onImageUpload}
            />
            <EditorContent editor={editor} />
        </div>
    );
}