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

function SortableBlockItem({ block, onDelete, onUpdate }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="py-4 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Drag handle */}
          <button
            type="button"
            className="border rounded px-2 py-1 text-sm cursor-grab active:cursor-grabbing"
            title="Drag to reorder"
            {...attributes}
            {...listeners}
          >
            ⠿
          </button>

          <div className="text-sm font-medium">
            {block.type.toUpperCase()}
            {block.type === "heading" && ` (H${block.heading_level})`}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onDelete(block.id)}
          className="border rounded px-2 py-1 text-sm text-red-600"
        >
          ✕
        </button>
      </div>

      {(block.type === "heading" || block.type === "paragraph") && (
        <textarea
          className="border rounded px-3 py-2 w-full"
          value={block.text ?? ""}
          onChange={(e) => onUpdate(block.id, { text: e.target.value })}
        />
      )}

      {block.type === "image" && (
        <input
          className="border rounded px-3 py-2 w-full"
          placeholder="Image path"
          value={block.image_path ?? ""}
          onChange={(e) => onUpdate(block.id, { image_path: e.target.value })}
        />
      )}
    </div>
  );
}

export default function SubsectionEditor({ subsectionId }) {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [type, setType] = useState("paragraph");
  const [headingLevel, setHeadingLevel] = useState(2);
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState(null);

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

    let payload = { type };

    if (type === "image") {
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
    }

    if (type === "heading") {
      payload.heading_level = headingLevel;
      payload.text = text;
    }

    if (type === "paragraph") {
      payload.text = text;
    }

    await axios.post(`/api/admin/subsections/${subsectionId}/blocks`, payload);

    setText("");
    setImageFile(null);
    setType("paragraph");
    await loadBlocks();
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

      <div className="py-8">
        <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-6">
          <a href="/admin/products" className="text-sm underline">
            ← Back
          </a>

          {/* Add Block */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="font-semibold mb-4">Add Block</h3>

            <form onSubmit={createBlock} className="space-y-3">
              <select
                className="border rounded px-3 py-2 w-full"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="heading">Heading</option>
                <option value="paragraph">Paragraph</option>
                <option value="image">Image</option>
              </select>

              {type === "heading" && (
                <>
                  <select
                    className="border rounded px-3 py-2 w-full"
                    value={headingLevel}
                    onChange={(e) => setHeadingLevel(Number(e.target.value))}
                  >
                    <option value={2}>Heading (H2)</option>
                    <option value={3}>Subheading (H3)</option>
                  </select>

                  <textarea
                    className="border rounded px-3 py-2 w-full"
                    placeholder="Heading text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    required
                  />
                </>
              )}

              {type === "paragraph" && (
                <textarea
                  className="border rounded px-3 py-2 w-full"
                  placeholder="Paragraph text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  required
                />
              )}

              {type === "image" && (
                <input
                  type="file"
                  accept="image/*"
                  className="border rounded px-3 py-2 w-full"
                  onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                  required
                />
              )}

              <button type="submit" className="bg-black text-white rounded px-4 py-2">
                Add Block
              </button>
            </form>
          </div>

          {/* Blocks */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="font-semibold mb-4">Blocks</h3>

            {loading ? (
              <div>Loading…</div>
            ) : blocks.length === 0 ? (
              <div>No blocks yet.</div>
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
                  <div className="divide-y">
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
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
