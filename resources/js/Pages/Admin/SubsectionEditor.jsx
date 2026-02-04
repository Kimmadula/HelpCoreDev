import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import axios from "axios";
import { useEffect, useState } from "react";
import RichTextEditor from "@/Components/RichTextEditor";
import Modal from "@/Components/Modal"; // Added Modal import

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

// Constants
const ALIGN_OPTIONS = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
];

function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  if (path.startsWith('/storage/')) return path;
  return `/ storage / ${path} `;
}

function getYouTubeId(url) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

function SortableBlockItem({ block, onDelete, onUpdate }) {
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

  const getSummary = () => {
    if (block.type === 'heading') return block.text || '(Empty Heading)';
    if (block.type === 'paragraph') return block.text ? block.text.substring(0, 200) + (block.text.length > 200 ? '...' : '') : '(Empty Paragraph)';
    if (block.type === 'richtext') return block.text ? block.text.replace(/<[^>]*>?/gm, '').substring(0, 200) + '...' : '(Empty Rich Text)';
    if (block.type === 'list') return (block.list_items?.length || 0) + ' items';
    if (block.type === 'image') return block.image_path || '(No Image)';
    return block.type;
  };

  return (
    <div ref={setNodeRef} style={style} className={`bg - white border rounded - lg shadow - sm mb - 3 transition - all ${isExpanded ? 'ring-2 ring-blue-500' : 'hover:border-gray-400'} `}>
      {/* Header / Summary Row */}
      <div className="flex items-center justify-between p-3 bg-white border-b border-gray-100 rounded-lg select-none hover:bg-gray-50 transition group">
        <div className="flex items-center gap-4 overflow-hidden">
          <button
            type="button"
            className="text-gray-300 hover:text-gray-600 cursor-grab active:cursor-grabbing px-1"
            {...attributes}
            {...listeners}
          >
            <span className="text-xl leading-none">⋮⋮</span>
          </button>

          <div
            className="flex flex-col gap-0.5 cursor-pointer flex-1 min-w-0"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <span className="text-sm text-gray-900 font-semibold line-clamp-1">
              {block.type === 'heading' ? (block.text || 'Empty Heading') :
                block.type === 'paragraph' ? (block.text || 'Empty Paragraph') :
                  block.type === 'list' ? `${block.list_items?.length || 0} items list` :
                    block.type === 'image' ? (block.image_path ? 'Image' : 'No Image') :
                      (block.text ? block.text.replace(/<[^>]*>?/gm, '').substring(0, 60) + (block.text.length > 60 ? '...' : '') : 'Rich Text Block')}
            </span>

            {/* Subtle type indicator instead of badge */}
            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold opacity-60 group-hover:opacity-100 transition-opacity">
              {block.type === 'richtext' ? 'Content' : block.type}
            </span>

            {isDirty && <span className="text-xs text-orange-500 font-bold">• Unsaved</span>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
            title={isExpanded ? "Collapse" : "Edit"}
          >
            {isExpanded ? "▼" : "✎"}
          </button>
          <button
            type="button"
            onClick={() => onDelete(block.id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
            title="Delete"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-4 border-t bg-white rounded-b-lg space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">

          {block.type !== 'richtext' && (
            <div className="flex items-center justify-between gap-4">
              <label className="text-xs font-semibold text-gray-500 uppercase">Alignment</label>
              <div className="flex bg-gray-100 rounded p-1 gap-1">
                {['left', 'center', 'right'].map(align => (
                  <button
                    key={align}
                    type="button"
                    onClick={() => onUpdate(block.id, { align })}
                    className={`p - 1 rounded text - xs px - 2 capitalization ${block.align === align ? 'bg-white shadow text-black font-medium' : 'text-gray-500 hover:text-gray-800'} `}
                  >
                    {align}
                  </button>
                ))}
              </div>
            </div>
          )}

          {block.type === "heading" && (
            <div className="space-y-2">
              <div className="flex gap-2">
                {[2, 3].map(lvl => (
                  <button
                    key={lvl}
                    onClick={() => { setLocalHeadingLevel(lvl); setIsDirty(true); }}
                    className={`px - 3 py - 1 text - xs font - bold rounded border ${localHeadingLevel === lvl ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-200'} `}
                  >H{lvl}</button>
                ))}
              </div>
              <input
                className="border p-2 rounded w-full font-bold text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={localText}
                onChange={(e) => { setLocalText(e.target.value); setIsDirty(true); }}
                placeholder="Heading Text"
              />
            </div>
          )}

          {block.type === "paragraph" && (
            <div className="space-y-1">
              {(() => {
                const ytId = getYouTubeId(block.text?.trim() ?? "");
                if (ytId) {
                  return (
                    <div className="mb-2 rounded-lg overflow-hidden border border-gray-200 bg-gray-900 aspect-video relative group">
                      <div className="absolute inset-0 z-10 bg-transparent group-hover:bg-black/10 transition pointer-events-none" />
                      <iframe
                        src={`https://www.youtube.com/embed/${ytId}`}
                        className="absolute inset-0 w-full h-full"
                        frameBorder="0"
                        allowFullScreen
                      />
                    </div >
                  )
                }
              })()}
              <textarea
                className="border p-2 rounded w-full min-h-[120px] text-gray-700 leading-relaxed focus:ring-2 focus:ring-blue-500 focus:outline-none resize-y"
                value={localText}
                onChange={(e) => { setLocalText(e.target.value); setIsDirty(true); }}
                placeholder="Write something..."
              />
              <div className="text-[10px] text-gray-400 flex justify-end">Markdown supported</div>
            </div >
          )}

          {
            block.type === "richtext" && (
              <div className="space-y-1">
                <RichTextEditor
                  value={localText}
                  onChange={(html) => { setLocalText(html); setIsDirty(true); }}
                />
              </div>
            )
          }

          {
            block.type === "image" && (
              <div className="space-y-3">
                <div className="flex gap-4">
                  {block.image_path && (
                    <div className="w-24 h-24 bg-gray-100 rounded border overflow-hidden flex-shrink-0">
                      <img src={getImageUrl(block.image_path)} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    <input
                      className="border p-2 rounded w-full text-sm font-mono bg-gray-50"
                      value={block.image_path ?? ""}
                      readOnly
                      placeholder="Image Path"
                    />
                    <div className="flex gap-2 text-xs">
                      <span className="text-gray-500 py-1">Width:</span>
                      {['sm', 'md', 'lg', 'full'].map(w => (
                        <button
                          key={w}
                          onClick={() => { setLocalImageWidth(w); setIsDirty(true); }}
                          className={`px-2 py-1 rounded border capitalize ${localImageWidth === w ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white text-gray-500'}`}
                        >
                          {w}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )
          }

          {
            block.type === "list" && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  {['bullet', 'number'].map(s => (
                    <button
                      key={s}
                      onClick={() => onUpdate(block.id, { list_style: s })}
                      className={`px-3 py-1 text-xs rounded border capitalize ${block.list_style === s ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600'}`}
                    >{s}s</button>
                  ))}
                </div>
                <textarea
                  className="border p-2 rounded w-full min-h-[150px] font-mono text-sm bg-gray-50 focus:bg-white transition"
                  value={Array.isArray(block.list_items) ? block.list_items.join("\n") : (block.list_items ?? "")}
                  onChange={(e) => onUpdate(block.id, { list_items: e.target.value.split("\n") })}
                  placeholder="List items..."
                />
              </div>
            )
          }

          {/* SAVE BUTTON */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={!isDirty || isSaving}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${isDirty
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

        </div >
      )}
    </div >
  );
}

export default function SubsectionEditor({ subsectionId }) {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);

  // Tabbed interface state
  const [activeTab, setActiveTab] = useState("richtext");

  const [headingLevel, setHeadingLevel] = useState(2);
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [align, setAlign] = useState("left");
  const [imageWidth, setImageWidth] = useState("md");
  const [listStyle, setListStyle] = useState("bullet");
  const [listText, setListText] = useState("");
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

    let payload = { type: activeTab, align };



    if (activeTab === "list") {
      const items = listText.split("\n").map((s) => s.trim()).filter(Boolean);
      if (items.length === 0) {
        alert("Please add at least one list item.");
        return;
      }
      payload.list_style = listStyle;
      payload.list_items = items;
    }

    if (activeTab === "heading") {
      if (!text.trim()) {
        alert("Please enter heading text.");
        return;
      }
      payload.heading_level = headingLevel;
      payload.text = text;
    }

    if (activeTab === "paragraph") {
      if (!text.trim()) {
        alert("Please enter paragraph text.");
        return;
      }
      payload.text = text;
    }

    if (activeTab === "richtext") {
      // Basic check for empty HTML (stripping tags) or zero-width spaces
      const stripped = richTextContent.replace(/<[^>]*>/g, '').trim();
      if (!stripped && !richTextContent.includes('<img') && !richTextContent.includes('<iframe')) {
        alert("Please enter some content.");
        return;
      }
      payload.text = richTextContent;
    }

    await axios.post(`/api/admin/subsections/${subsectionId}/blocks`, payload);

    setText("");
    setImageFile(null);
    setListText("");
    setRichTextContent("");
    setShowAddModal(false); // Close modal on success
    await loadBlocks();

    // Auto-scroll to bottom
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
        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
          Admin • Subsection Content
        </h2>
      }
    >
      <Head title="Subsection Editor" />

      <Modal show={showAddModal} onClose={() => setShowAddModal(false)} maxWidth="2xl">
        <div className="bg-white rounded-xl overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-800 text-lg">Add New Block</h3>
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="text-gray-400 hover:text-gray-600 text-xl font-bold"
            >✕</button>
          </div>

          <form onSubmit={createBlock} className="p-6 space-y-5">
            <div className="space-y-1 animate-in slide-in-from-right-2 duration-200">
              <div className="mb-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Content (Rich Text)</label>
              </div>
              <RichTextEditor
                value={richTextContent}
                onChange={setRichTextContent}
              />
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-5 py-2.5 rounded-xl font-semibold text-gray-500 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-blue-200 transition transform active:scale-95">
                Add Block
              </button>
            </div>
          </form>
        </div>
      </Modal>

      <div className="py-8">
        <div className="max-w-[95%] mx-auto sm:px-6 lg:px-8 space-y-6">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              if (window.history.length > 1) window.history.back();
              else window.location.href = "/admin/products";
            }}
            className="text-sm underline mb-4 inline-block text-gray-500 hover:text-black transition"
          >
            ← Back
          </button>

          {/* Layout: Content Blocks List */}
          <div className="space-y-12">

            {/* 1. Add Block Form */}
            {/* Moved to Modal */}

            {/* 2. Blocks List */}
            <div className="max-w-5xl mx-auto w-full">
              <div className="bg-white/50 backdrop-blur-sm rounded-xl">
                <div className="flex items-center justify-between mb-4 px-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-lg text-gray-800">Content Blocks</h3>
                    <span className="text-xs text-gray-500 bg-white border px-2 py-0.5 rounded-full">{blocks.length}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition shadow-lg shadow-gray-200"
                  >
                    <span className="text-xl leading-none font-bold">+</span>
                    <span className="text-sm font-bold">Add Block</span>
                  </button>

                </div>

                {loading ? (
                  <div className="p-8 text-center text-gray-400">Loading content...</div>
                ) : blocks.length === 0 ? (
                  <div className="p-12 border-2 border-dashed border-gray-200 rounded-xl text-center">
                    <p className="text-gray-400 mb-2">This subsection is empty.</p>
                    <button
                      type="button"
                      onClick={() => setShowAddModal(true)}
                      className="text-blue-600 font-bold hover:underline"
                    >
                      Create your first block
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
                      <div className="space-y-2">
                        {blocks.map((b) => (
                          <SortableBlockItem
                            key={b.id}
                            block={b}
                            onDelete={deleteBlock}
                            onUpdate={updateBlock}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}
                {/* Invisible element to scroll to */}
                <div id="bottom-of-blocks" className="h-4"></div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </AuthenticatedLayout>
  );
}
