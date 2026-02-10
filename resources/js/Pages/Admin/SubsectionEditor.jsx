import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import axios from "axios";
import { useEffect, useState } from "react";
import RichTextEditor from "@/Components/RichTextEditor";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  if (path.startsWith('/storage/')) return path;
  return `/storage/${path}`;
}

function getYouTubeId(url) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

function SortableBlockItem({ block, onDelete, onUpdate, subsectionTitle }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: block.id });

  const [isExpanded, setIsExpanded] = useState(false);
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
  }, [block.text, block.image_width, block.heading_level, isExpanded]);

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

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 50 : "auto",
    position: "relative",
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

  const getBlockSummary = () => {
    if (block.type === 'heading') return block.text || 'Empty Heading';
    if (block.type === 'paragraph') {
      const text = block.text || 'Empty Paragraph';
      return text.length > 60 ? text.substring(0, 60) + '...' : text;
    }
    if (block.type === 'richtext') {
      const stripped = (block.text || '').replace(/<[^>]*>/g, '');
      return stripped ? (stripped.length > 60 ? stripped.substring(0, 60) + '...' : stripped) : 'Rich Text Block';
    }
    if (block.type === 'list') return `${block.list_items?.length || 0} items`;
    if (block.type === 'image') return block.image_path ? 'Image' : 'No Image';
    return block.type;
  };

  return (
    <div ref={setNodeRef} style={style} className={`bg-white rounded-lg border ${isExpanded ? 'border-blue-300 shadow-md' : 'border-gray-200 hover:border-gray-300'} transition-all`}>
      {/* Header */}
      <div className="p-4">
        <div className="flex items-center gap-3">
          {/* Drag Handle */}
          <button
            type="button"
            className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing p-1"
            {...attributes}
            {...listeners}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            </svg>
          </button>

          {/* Block Icon & Type */}
          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white">
            {getBlockTypeIcon()}
          </div>

          {/* Block Info */}
          <div
            className="flex-1 min-w-0 cursor-pointer"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-gray-900 truncate">
                {subsectionTitle}
              </h4>
              {isDirty && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-orange-100 text-orange-700">
                  Unsaved
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center px-3 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isExpanded ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                )}
              </svg>
              {isExpanded ? 'Collapse' : 'Edit'}
            </button>

            <button
              type="button"
              onClick={() => onDelete(block.id)}
              className="inline-flex items-center px-3 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-4 space-y-4">
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

          {/* Heading Block */}
          {block.type === "heading" && (
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
          )}

          {/* Paragraph Block */}
          {block.type === "paragraph" && (
            <div className="space-y-3">
              {(() => {
                const ytId = getYouTubeId(block.text?.trim() ?? "");
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
          )}

          {/* Rich Text Block */}
          {block.type === "richtext" && (
            <div>
              <RichTextEditor
                value={localText}
                onChange={(html) => { setLocalText(html); setIsDirty(true); }}
              />
            </div>
          )}

          {/* Image Block */}
          {block.type === "image" && (
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
          )}

          {/* List Block */}
          {block.type === "list" && (
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
          )}

          {/* Save Button */}
          <div className="flex justify-end pt-2 border-t border-gray-100">
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
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SubsectionEditor({ subsectionId, sectionId, subsectionTitle, sectionTitle, productTitle }) {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [richTextContent, setRichTextContent] = useState("");

  const loadBlocks = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/admin/subsections/${subsectionId}/blocks`);
      setBlocks(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlocks();
  }, [subsectionId]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = blocks.findIndex((b) => b.id === active.id);
    const newIndex = blocks.findIndex((b) => b.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const newArr = arrayMove(blocks, oldIndex, newIndex);
    setBlocks(newArr);

    try {
      await axios.put(`/api/admin/subsections/${subsectionId}/blocks/reorder`, {
        ordered_ids: newArr.map((b) => b.id),
      });
      await loadBlocks();
    } catch (err) {
      console.error(err);
      alert("Reorder failed. Reloading…");
      await loadBlocks();
    }
  };

  const createBlock = async (e) => {
    e.preventDefault();

    const stripped = richTextContent.replace(/<[^>]*>/g, '').trim();
    if (!stripped && !richTextContent.includes('<img') && !richTextContent.includes('<iframe')) {
      alert("Please enter some content.");
      return;
    }

    await axios.post(`/api/admin/subsections/${subsectionId}/blocks`, {
      type: 'richtext',
      text: richTextContent,
      align: 'left'
    });

    setRichTextContent("");
    setShowAddModal(false);
    await loadBlocks();

    setTimeout(() => {
      const bottom = document.getElementById("bottom-of-blocks");
      if (bottom) {
        bottom.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  const updateBlock = async (id, data) => {
    await axios.put(`/api/admin/blocks/${id}`, data);
    await loadBlocks();
  };

  const deleteBlock = async (id) => {
    if (!confirm("Delete this block?")) return;
    await axios.delete(`/api/admin/blocks/${id}`);
    await loadBlocks();
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="flex items-center gap-2 text-sm font-medium">
          <a href="/admin/products" className="text-gray-500 hover:text-blue-600 transition-colors">
            {productTitle}
          </a>
          <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <a href={`/admin/sections/${sectionId}/subsections`} className="text-gray-500 hover:text-blue-600 transition-colors">
            {sectionTitle}
          </a>
          <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-900 font-semibold">{subsectionTitle}</span>
        </div>
      }
    >
      <Head title="Article" />

      <div className="py-8">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Article Blocks</h3>
                <p className="mt-1 text-sm text-gray-600">
                  {loading ? "Loading..." : `${blocks.length} block${blocks.length !== 1 ? 's' : ''} total`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Block
              </button>
            </div>

            {loading ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-blue-600"></div>
                <p className="mt-4 text-gray-600">Loading content...</p>
              </div>
            ) : blocks.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h4 className="mt-4 text-lg font-medium text-gray-900">No content blocks yet</h4>
                <p className="mt-2 text-sm text-gray-600">Get started by adding your first content block.</p>
                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Your First Block
                </button>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={blocks.map((b) => b.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {blocks.map((b) => (
                      <SortableBlockItem
                        key={b.id}
                        block={b}
                        onDelete={deleteBlock}
                        onUpdate={updateBlock}
                        subsectionTitle={subsectionTitle}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
            <div id="bottom-of-blocks" className="h-4"></div>
          </div>
        </div>
      </div>


      {/* Add Block Modal */}
      {
        showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            {/* Backdrop */}
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowAddModal(false)}></div>

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
                      <h3 className="text-xl font-bold text-white">Add New Block</h3>
                      <p className="text-sm text-blue-100 mt-0.5">Create rich text content</p>
                    </div>
                  </div>
                  <button onClick={() => setShowAddModal(false)} className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Body (Scrollable) */}
              <div className="flex-1 p-6 overflow-y-auto">
                <form onSubmit={createBlock}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                      <RichTextEditor
                        value={richTextContent}
                        onChange={setRichTextContent}
                      />
                    </div>
                  </div>
                </form>
              </div>

              {/* Footer */}
              <div className="flex-shrink-0 flex gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={createBlock}
                  className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-lg hover:shadow-xl"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Block
                </button>
              </div>
            </div>
          </div>
        )
      }
    </AuthenticatedLayout >
  );
}