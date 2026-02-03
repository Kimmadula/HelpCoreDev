import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import axios from "axios";
import { useEffect, useState } from "react";

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
  return `/storage/${path}`;
  return `/storage/${path}`;
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

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 50 : "auto",
    position: "relative",
  };

  const getSummary = () => {
    if (block.type === 'heading') return block.text || '(Empty Heading)';
    if (block.type === 'paragraph') return block.text ? block.text.substring(0, 60) + (block.text.length > 60 ? '...' : '') : '(Empty Paragraph)';
    if (block.type === 'list') return (block.list_items?.length || 0) + ' items';
    if (block.type === 'image') return block.image_path || '(No Image)';
    return block.type;
  };

  return (
    <div ref={setNodeRef} style={style} className={`bg-white border rounded-lg shadow-sm mb-3 transition-all ${isExpanded ? 'ring-2 ring-blue-500' : 'hover:border-gray-400'}`}>
      {/* Header / Summary Row */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-t-lg select-none">
        <div className="flex items-center gap-3 overflow-hidden">
          <button
            type="button"
            className="text-gray-400 hover:text-gray-700 cursor-grab active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <span className="text-lg leading-none">⋮⋮</span>
          </button>

          <div
            className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${block.type === 'heading' ? 'bg-indigo-100 text-indigo-700' :
              block.type === 'image' ? 'bg-pink-100 text-pink-700' :
                block.type === 'list' ? 'bg-green-100 text-green-700' :
                  'bg-gray-100 text-gray-700'
              }`}>
              {block.type === 'heading' ? `H${block.heading_level}` : block.type}
            </span>
            <span className="text-sm text-gray-600 truncate font-medium">
              {getSummary()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-gray-500 hover:text-blue-600 transition"
            title={isExpanded ? "Collapse" : "Edit"}
          >
            {isExpanded ? "▼" : "✎"}
          </button>
          <button
            type="button"
            onClick={() => onDelete(block.id)}
            className="p-1 text-gray-400 hover:text-red-600 transition"
            title="Delete"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-4 border-t bg-white rounded-b-lg space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">

          <div className="flex items-center justify-between gap-4">
            <label className="text-xs font-semibold text-gray-500 uppercase">Alignment</label>
            <div className="flex bg-gray-100 rounded p-1 gap-1">
              {['left', 'center', 'right'].map(align => (
                <button
                  key={align}
                  type="button"
                  onClick={() => onUpdate(block.id, { align })}
                  className={`p-1 rounded text-xs px-2 capitalization ${block.align === align ? 'bg-white shadow text-black font-medium' : 'text-gray-500 hover:text-gray-800'}`}
                >
                  {align}
                </button>
              ))}
            </div>
          </div>

          {block.type === "heading" && (
            <div className="space-y-2">
              <div className="flex gap-2">
                {[2, 3].map(lvl => (
                  <button
                    key={lvl}
                    onClick={() => onUpdate(block.id, { heading_level: lvl })}
                    className={`px-3 py-1 text-xs font-bold rounded border ${block.heading_level === lvl ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-200'}`}
                  >H{lvl}</button>
                ))}
              </div>
              <input
                className="border p-2 rounded w-full font-bold text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={block.text ?? ""}
                onChange={(e) => onUpdate(block.id, { text: e.target.value })}
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
                    </div>
                  )
                }
              })()}
              <textarea
                className="border p-2 rounded w-full min-h-[120px] text-gray-700 leading-relaxed focus:ring-2 focus:ring-blue-500 focus:outline-none resize-y"
                value={block.text ?? ""}
                onChange={(e) => onUpdate(block.id, { text: e.target.value })}
                placeholder="Write something..."
              />
              <div className="text-[10px] text-gray-400 flex justify-end">Markdown supported</div>
            </div>
          )}

          {block.type === "image" && (
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
                    onChange={(e) => onUpdate(block.id, { image_path: e.target.value })}
                    placeholder="Image Path"
                  />
                  <div className="flex gap-2 text-xs">
                    <span className="text-gray-500 py-1">Width:</span>
                    {['sm', 'md', 'lg', 'full'].map(w => (
                      <button
                        key={w}
                        onClick={() => onUpdate(block.id, { image_width: w })}
                        className={`px-2 py-1 rounded border capitalize ${block.image_width === w ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white text-gray-500'}`}
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {block.type === "list" && (
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
          )}
        </div>
      )}
    </div>
  );
}

export default function SubsectionEditor({ subsectionId }) {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tabbed interface state
  const [activeTab, setActiveTab] = useState("paragraph");

  const [headingLevel, setHeadingLevel] = useState(2);
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [align, setAlign] = useState("left");
  const [imageWidth, setImageWidth] = useState("md");
  const [listStyle, setListStyle] = useState("bullet");
  const [listText, setListText] = useState("");


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

    if (activeTab === "image") {
      if (!imageFile) {
        alert("Please choose an image file.");
        return;
      }
      const formData = new FormData();
      formData.append("image", imageFile);
      const uploadRes = await axios.post("/api/admin/uploads/images", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      payload.image_path = uploadRes.data.path;
      payload.image_width = imageWidth;
    }

    if (activeTab === "list") {
      payload.list_style = listStyle;
      payload.list_items = listText.split("\n").map((s) => s.trim()).filter(Boolean);
    }

    if (activeTab === "heading") {
      payload.heading_level = headingLevel;
      payload.text = text;
    }

    if (activeTab === "paragraph") {
      payload.text = text;
    }

    await axios.post(`/api/admin/subsections/${subsectionId}/blocks`, payload);

    setText("");
    setImageFile(null);
    setListText("");
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

  const blockTypes = [
    { id: 'paragraph', label: 'Text', icon: '¶' },
    { id: 'heading', label: 'Heading', icon: 'H' },
    { id: 'list', label: 'List', icon: '≣' },
    { id: 'image', label: 'Image', icon: '🖼' },
  ];

  return (
    <AuthenticatedLayout
      header={
        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
          Admin • Subsection Content
        </h2>
      }
    >
      <Head title="Subsection Editor" />

      <div className="py-8">
        <div className="max-w-6xl mx-auto sm:px-6 lg:px-8 space-y-6">
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left Column: Blocks List */}
            <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">
              <div className="bg-white/50 backdrop-blur-sm rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg text-gray-800">Content Blocks</h3>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{blocks.length} blocks</span>
                </div>

                {loading ? (
                  <div className="p-8 text-center text-gray-400">Loading content...</div>
                ) : blocks.length === 0 ? (
                  <div className="p-12 border-2 border-dashed border-gray-200 rounded-xl text-center">
                    <p className="text-gray-400 mb-2">This subsection is empty.</p>
                    <p className="text-sm text-gray-500">Use the panel on the right to add content.</p>
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

            {/* Right Column: Add Block Form (Sticky) */}
            <div className="lg:col-span-1 order-1 lg:order-2 sticky top-4">
              <div className="bg-white shadow-xl shadow-gray-200 rounded-xl border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                  <h3 className="font-bold text-gray-800">Add New Block</h3>
                </div>

                {/* Tab Navigation */}
                <div className="grid grid-cols-4 border-b border-gray-100 divide-x divide-gray-100">
                  {blockTypes.map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setActiveTab(t.id)}
                      className={`py-3 flex flex-col items-center gap-1 hover:bg-gray-50 transition ${activeTab === t.id ? 'bg-white text-blue-600 shadow-[inset_0_-2px_0_0_rgba(37,99,235,1)]' : 'bg-gray-50/50 text-gray-500'}`}
                    >
                      <span className="text-sm font-bold">{t.icon}</span>
                      <span className="text-[10px] uppercase font-bold tracking-wide">{t.label}</span>
                    </button>
                  ))}
                </div>

                <form onSubmit={createBlock} className="p-6 space-y-5">

                  {/* Common: Alignment */}
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Alignment</label>
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                      {['left', 'center', 'right'].map(a => (
                        <button
                          key={a}
                          type="button"
                          onClick={() => setAlign(a)}
                          className={`flex-1 py-1.5 text-xs rounded-md capitalize font-medium transition ${align === a ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                          {a}
                        </button>
                      ))}
                    </div>
                  </div>


                  {activeTab === "heading" && (
                    <div className="space-y-3 animate-in slide-in-from-right-2 duration-200">
                      <div className="flex gap-2">
                        {[2, 3].map(lvl => (
                          <button
                            type="button"
                            key={lvl}
                            onClick={() => setHeadingLevel(lvl)}
                            className={`flex-1 py-2 px-3 border rounded-lg text-sm font-bold transition ${headingLevel === lvl ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 hover:border-gray-400'}`}
                          >
                            Heading {lvl}
                          </button>
                        ))}
                      </div>
                      <textarea
                        className="w-full border-gray-200 rounded-lg p-3 text-lg font-bold placeholder-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        placeholder="Write your heading..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        required
                        rows={2}
                      />
                    </div>
                  )}

                  {activeTab === "paragraph" && (
                    <div className="space-y-1 animate-in slide-in-from-right-2 duration-200">
                      <textarea
                        className="w-full border-gray-200 rounded-lg p-3 text-sm leading-relaxed placeholder-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition min-h-[140px]"
                        placeholder="Start typing your paragraph content..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        required
                      />
                      <div className="flex justify-between text-[10px] text-gray-400 px-1">
                        <span>Markdown supported</span>
                        <span>**bold**</span>
                      </div>
                    </div>
                  )}

                  {activeTab === "image" && (
                    <div className="space-y-4 animate-in slide-in-from-right-2 duration-200">
                      <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:bg-gray-50 transition cursor-pointer relative">
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                          required
                        />
                        <div className="text-gray-400">
                          {imageFile ? (
                            <span className="text-blue-600 font-medium">{imageFile.name}</span>
                          ) : (
                            <>
                              <span className="block text-2xl mb-1">🖼</span>
                              <span className="text-xs">Click to upload image</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Width</label>
                        <select
                          className="w-full border-gray-200 rounded-lg text-sm bg-white py-2"
                          value={imageWidth}
                          onChange={(e) => setImageWidth(e.target.value)}
                        >
                          <option value="sm">Small (320px)</option>
                          <option value="md">Medium (520px)</option>
                          <option value="lg">Large (760px)</option>
                          <option value="full">Full Width</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {activeTab === "list" && (
                    <div className="space-y-3 animate-in slide-in-from-right-2 duration-200">
                      <div className="flex bg-gray-100 p-1 rounded-lg">
                        {[{ id: 'bullet', l: 'Bullets' }, { id: 'number', l: 'Numbers' }].map(s => (
                          <button
                            type="button"
                            key={s.id}
                            onClick={() => setListStyle(s.id)}
                            className={`flex-1 py-1.5 text-xs rounded-md font-medium transition ${listStyle === s.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                          >
                            {s.l}
                          </button>
                        ))}
                      </div>

                      <textarea
                        className="w-full border-gray-200 rounded-lg p-3 font-mono text-sm bg-gray-50 focus:bg-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition min-h-[140px]"
                        placeholder={"- Item 1\n- Item 2\n- Item 3"}
                        value={listText}
                        onChange={(e) => setListText(e.target.value)}
                        required />
                    </div>
                  )}


                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-200 transition transform active:scale-95">
                    Add +
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
