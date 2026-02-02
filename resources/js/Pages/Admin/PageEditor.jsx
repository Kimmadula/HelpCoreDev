import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import axios from "axios";
import { useEffect, useState } from "react";

export default function PageEditor({ pageId }) {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [type, setType] = useState("paragraph");
  const [headingLevel, setHeadingLevel] = useState(2);
  const [text, setText] = useState("");
  const [imagePath, setImagePath] = useState("");

  const loadBlocks = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/admin/pages/${pageId}/blocks`);
      setBlocks(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlocks();
  }, [pageId]);

  const createBlock = async (e) => {
    e.preventDefault();

    const payload = { type };

    if (type === "heading") {
      payload.heading_level = headingLevel;
      payload.text = text;
    }

    if (type === "paragraph") {
      payload.text = text;
    }

    if (type === "image") {
      payload.image_path = imagePath;
    }

    await axios.post(`/api/admin/pages/${pageId}/blocks`, payload);

    setText("");
    setImagePath("");
    setHeadingLevel(2);
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

  const move = async (index, direction) => {
    const newArr = [...blocks];
    const swapWith = direction === "up" ? index - 1 : index + 1;
    if (swapWith < 0 || swapWith >= newArr.length) return;

    [newArr[index], newArr[swapWith]] = [newArr[swapWith], newArr[index]];
    setBlocks(newArr);

    await axios.put(`/api/admin/pages/${pageId}/blocks/reorder`, {
      ordered_ids: newArr.map((b) => b.id),
    });

    await loadBlocks();
  };

  return (
    <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Admin • Page Editor</h2>}>
      <Head title="Page Editor" />

      <div className="py-8">
        <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-6">
          <a href="/admin/products" className="text-sm underline">← Back</a>

          {/* Add block */}
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
                  className="border rounded px-3 py-2 w-full"
                  placeholder="Image URL (upload later)"
                  value={imagePath}
                  onChange={(e) => setImagePath(e.target.value)}
                  required
                />
              )}

              <button className="bg-black text-white rounded px-4 py-2">
                Add Block
              </button>
            </form>
          </div>

          {/* Blocks list */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="font-semibold mb-4">Blocks</h3>

            {loading ? (
              <div>Loading…</div>
            ) : blocks.length === 0 ? (
              <div>No blocks yet.</div>
            ) : (
              <div className="divide-y">
                {blocks.map((b, idx) => (
                  <div key={b.id} className="py-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">
                        {b.type.toUpperCase()}
                        {b.type === "heading" && ` (H${b.heading_level})`}
                      </div>

                      <div className="flex gap-2">
                        <button onClick={() => move(idx, "up")} className="border px-2">↑</button>
                        <button onClick={() => move(idx, "down")} className="border px-2">↓</button>
                        <button onClick={() => deleteBlock(b.id)} className="border px-2 text-red-600">✕</button>
                      </div>
                    </div>

                    {b.type === "heading" && (
                      <textarea
                        className="border rounded px-3 py-2 w-full"
                        value={b.text}
                        onChange={(e) => updateBlock(b.id, { text: e.target.value })}
                      />
                    )}

                    {b.type === "paragraph" && (
                      <textarea
                        className="border rounded px-3 py-2 w-full"
                        value={b.text}
                        onChange={(e) => updateBlock(b.id, { text: e.target.value })}
                      />
                    )}

                    {b.type === "image" && (
                      <input
                        className="border rounded px-3 py-2 w-full"
                        value={b.image_path}
                        onChange={(e) => updateBlock(b.id, { image_path: e.target.value })}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}