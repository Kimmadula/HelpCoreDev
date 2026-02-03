import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import axios from "axios";
import { useEffect, useState } from "react";

export default function ProductSections({ productId }) {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [isPublished, setIsPublished] = useState(true);

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPublished, setEditPublished] = useState(true);

  const loadSections = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/admin/products/${productId}/sections`);
      setSections(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSections();
  }, [productId]);

  const createSection = async (e) => {
    e.preventDefault();
    await axios.post(`/api/admin/products/${productId}/sections`, {
      title,
      is_published: isPublished,
    });
    setTitle("");
    setIsPublished(true);
    await loadSections();
  };

  const startEdit = (s) => {
    setEditingId(s.id);
    setEditTitle(s.title);
    setEditPublished(!!s.is_published);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditPublished(true);
  };

  const updateSection = async (e) => {
    e.preventDefault();
    await axios.put(`/api/admin/sections/${editingId}`, {
      title: editTitle,
      is_published: editPublished,
    });
    await loadSections();
    cancelEdit();
  };

  const deleteSection = async (id) => {
    if (!confirm("Delete this section?")) return;
    await axios.delete(`/api/admin/sections/${id}`);
    await loadSections();
    if (editingId === id) cancelEdit();
  };

  const move = async (index, direction) => {
    const newArr = [...sections];
    const swapWith = direction === "up" ? index - 1 : index + 1;
    if (swapWith < 0 || swapWith >= newArr.length) return;

    [newArr[index], newArr[swapWith]] = [newArr[swapWith], newArr[index]];
    setSections(newArr);

    await axios.put(`/api/admin/products/${productId}/sections/reorder`, {
      ordered_ids: newArr.map((s) => s.id),
    });

    await loadSections();
  };

  return (
    <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Admin • Sections</h2>}>
      <Head title="Admin Sections" />

      <div className="py-8">
        <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <a href="/admin/products" className="text-sm underline">← Back to Products</a>

            <h3 className="font-semibold mt-4 mb-4">Add Section</h3>
            <form onSubmit={createSection} className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                className="border rounded px-3 py-2"
                placeholder="Section title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                />
                Published
              </label>
              <button className="bg-black text-white rounded px-4 py-2">Create</button>
            </form>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="font-semibold mb-4">Sections</h3>

            {loading ? (
              <div>Loading…</div>
            ) : sections.length === 0 ? (
              <div>No sections yet.</div>
            ) : (
              <div className="divide-y">
                {sections.map((s, idx) => (
                  <div key={s.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{s.title}</div>
                      <div className="text-sm text-gray-600">
                        {s.is_published ? "Published" : "Draft"}
                      </div>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <button className="border rounded px-3 py-1 text-sm" onClick={() => move(idx, "up")}>↑</button>
                      <button className="border rounded px-3 py-1 text-sm" onClick={() => move(idx, "down")}>↓</button>
                      <button className="border rounded px-3 py-1 text-sm" onClick={() => startEdit(s)}>Edit</button>
                      <button className="border rounded px-3 py-1 text-sm text-red-600" onClick={() => deleteSection(s.id)}>Delete</button>

                      <a className="border rounded px-3 py-1 text-sm" href={`/admin/sections/${s.id}/subsections`}>
                        Subsections
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {editingId && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="font-semibold mb-4">Edit Section</h3>
              <form onSubmit={updateSection} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  className="border rounded px-3 py-2"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                />
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={editPublished}
                    onChange={(e) => setEditPublished(e.target.checked)}
                  />
                  Published
                </label>
                <div className="flex gap-2">
                  <button className="bg-black text-white rounded px-4 py-2">Save</button>
                  <button type="button" className="border rounded px-4 py-2" onClick={cancelEdit}>Cancel</button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
