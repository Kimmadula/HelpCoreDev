import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useToast } from "@/Contexts/ToastContext";
import Skeleton from "@/Components/Skeleton";

export default function SectionPages({ sectionId }) {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [isPublished, setIsPublished] = useState(true);

  // Edit
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editPublished, setEditPublished] = useState(true);
  const toast = useToast();

  const loadPages = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/admin/sections/${sectionId}/pages`);
      setPages(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPages();
  }, [sectionId]);

  const createPage = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/api/admin/sections/${sectionId}/pages`, {
        title,
        slug: slug.trim() === "" ? null : slug.trim(),
        is_published: isPublished,
      });
      setTitle("");
      setSlug("");
      setIsPublished(true);
      await loadPages();
      toast.success("Page created successfully.");
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Failed to create page");
      console.error(err);
    }
  };

  const startEdit = (p) => {
    setEditingId(p.id);
    setEditTitle(p.title);
    setEditSlug(p.slug);
    setEditPublished(!!p.is_published);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditSlug("");
    setEditPublished(true);
  };

  const updatePage = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/admin/pages/${editingId}`, {
        title: editTitle,
        slug: editSlug,
        is_published: editPublished,
      });
      await loadPages();
      cancelEdit();
      toast.success("Page updated successfully.");
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Failed to update page");
      console.error(err);
    }
  };

  const deletePage = async (id) => {
    if (!confirm("Delete this page? (its blocks will also be deleted)")) return;
    await axios.delete(`/api/admin/pages/${id}`);
    await loadPages();
    if (editingId === id) cancelEdit();
    toast.success("Page deleted successfully.");
  };

  const move = async (index, direction) => {
    const newArr = [...pages];
    const swapWith = direction === "up" ? index - 1 : index + 1;
    if (swapWith < 0 || swapWith >= newArr.length) return;

    // 1. Optimistic Update
    const previousPages = [...pages];
    [newArr[index], newArr[swapWith]] = [newArr[swapWith], newArr[index]];
    setPages(newArr);

    try {
      // 2. Background Request
      await axios.put(`/api/admin/sections/${sectionId}/pages/reorder`, {
        ordered_ids: newArr.map((p) => p.id),
      });
      // Success: No need to reload
    } catch (error) {
      console.error("Reorder failed:", error);
      // 3. Rollback
      setPages(previousPages);
      toast.error("Failed to reorder pages. Please try again.");
    }
  };

  return (
    <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Admin • Pages</h2>}>
      <Head title="Admin Pages" />

      <div className="py-8">
        <div className="max-w-5xl mx-auto sm:px-6 lg:px-8 space-y-6">
          <div className="bg-white shadow rounded-lg p-6">


            <h3 className="font-semibold mt-4 mb-4">Add Page</h3>
            <form onSubmit={createPage} className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input
                className="border rounded px-3 py-2"
                placeholder="Page title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <input
                className="border rounded px-3 py-2"
                placeholder="Slug (optional)"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
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
            <h3 className="font-semibold mb-4">Pages</h3>

            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" count={5} />
              </div>
            ) : pages.length === 0 ? (
              <div>No pages yet.</div>
            ) : (
              <div className="divide-y">
                {pages.map((p, idx) => (
                  <div key={p.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{p.title}</div>
                      <div className="text-sm text-gray-600 truncate">
                        slug: <span className="font-mono">{p.slug}</span> •{" "}
                        {p.is_published ? "Published" : "Draft"}
                      </div>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <button className="border rounded px-3 py-1 text-sm" onClick={() => move(idx, "up")}>↑</button>
                      <button className="border rounded px-3 py-1 text-sm" onClick={() => move(idx, "down")}>↓</button>
                      <button className="border rounded px-3 py-1 text-sm" onClick={() => startEdit(p)}>Edit</button>
                      <button className="border rounded px-3 py-1 text-sm text-red-600" onClick={() => deletePage(p.id)}>Delete</button>

                      {/* Next step: Block Editor */}
                      <a className="border rounded px-3 py-1 text-sm" href={`/admin/pages/${p.id}/edit`}>
                        Edit Content
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {editingId && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="font-semibold mb-4">Edit Page</h3>
              <form onSubmit={updatePage} className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <input className="border rounded px-3 py-2" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required />
                <input className="border rounded px-3 py-2" value={editSlug} onChange={(e) => setEditSlug(e.target.value)} required />
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={editPublished} onChange={(e) => setEditPublished(e.target.checked)} />
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
