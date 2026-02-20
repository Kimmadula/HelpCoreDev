import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useToast } from "@/Contexts/ToastContext";
import ConfirmDialog from "@/Components/ConfirmDialog";
import Skeleton from "@/Components/Skeleton";
import { CreateSectionModal, EditSectionModal } from "@/Components/Admin/Sections/SectionModals";

export default function ProductSections({ productId, productTitle }) {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPublished, setEditPublished] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const toast = useToast();

  const createSection = async (e) => {
    e.preventDefault();
    await axios.post(`/api/admin/products/${productId}/sections`, {
      title,
      is_published: isPublished,
    });
    setTitle("");
    setIsPublished(true);
    setShowCreateModal(false);
    await loadSections();
    toast.success("Section created successfully.");
  };

  const loadSections = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/admin/products/${productId}/sections`);
      setSections(Array.isArray(res.data) ? res.data : (res.data.data || []));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSections();
  }, [productId]);

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
    toast.success("Section updated successfully.");
  };

  const startDelete = (id) => {
    setDeletingId(id);
  };

  const cancelDelete = () => {
    setDeletingId(null);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    await axios.delete(`/api/admin/sections/${deletingId}`);
    await loadSections();
    if (editingId === deletingId) cancelEdit();
    cancelDelete();
    toast.success("Section deleted successfully.");
  };

  const move = async (index, direction) => {
    const newArr = [...sections];
    const swapWith = direction === "up" ? index - 1 : index + 1;
    if (swapWith < 0 || swapWith >= newArr.length) return;

    const previousSections = [...sections];
    [newArr[index], newArr[swapWith]] = [newArr[swapWith], newArr[index]];
    setSections(newArr);

    try {
      await axios.put(`/api/admin/products/${productId}/sections/reorder`, {
        ordered_ids: newArr.map((s) => s.id),
      });
    } catch (error) {
      console.error("Reorder failed:", error);
      setSections(previousSections);
      toast.error("Failed to reorder sections. Please try again.");
    }
  };

  const deletingSection = sections.find((s) => s.id === deletingId);

  return (
    <AuthenticatedLayout
      header={
        <div className="flex items-center gap-2 text-sm font-medium">
          <a href="/admin/products" className="text-gray-500 hover:text-blue-600 transition-colors">
            Products
          </a>
          <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-900 font-semibold">{productTitle}</span>
        </div>
      }
    >
      <Head title="Sections" />

      <div className="py-2">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="space-y-6">

            {/* Back Navigation */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Sections</h3>
                <p className="mt-1 text-sm text-gray-600">
                  {loading ? "Loading..." : `${sections.length} section${sections.length !== 1 ? 's' : ''} total`}
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Section
              </button>
            </div>

            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-16 w-full rounded-lg" count={3} />
              </div>
            ) : sections.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                <h4 className="mt-4 text-lg font-medium text-gray-900">No sections yet</h4>
                <p className="mt-2 text-sm text-gray-600">Get started by creating your first section above.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {sections.map((s, idx) => (
                  <div key={s.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => move(idx, "up")}
                            disabled={idx === 0}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Move up"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => move(idx, "down")}
                            disabled={idx === sections.length - 1}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Move down"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-gray-900 truncate">{s.title}</div>
                          <div className="text-sm text-gray-500 truncate flex items-center gap-2">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${s.is_published
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-600'
                                }`}
                            >
                              {s.is_published ? 'Published' : 'Draft'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 shrink-0">
                        <a
                          href={`/admin/sections/${s.id}/subsections`}
                          className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                          </svg>
                          Subsections
                        </a>
                        <button
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          onClick={() => startEdit(s)}
                          title="Edit Section">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          onClick={() => startDelete(s.id)}
                          title="Delete Section"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Create Modal */}
            <CreateSectionModal
              show={showCreateModal}
              onClose={() => setShowCreateModal(false)}
              onCreate={createSection}
              title={title}
              setTitle={setTitle}
              isPublished={isPublished}
              setIsPublished={setIsPublished}
            />

            {/* Edit Modal */}
            <EditSectionModal
              show={!!editingId}
              onClose={cancelEdit}
              onUpdate={updateSection}
              editTitle={editTitle}
              setEditTitle={setEditTitle}
              editPublished={editPublished}
              setEditPublished={setEditPublished}
            />

            {/* Delete Modal */}
            <ConfirmDialog
              isOpen={!!deletingId}
              onClose={cancelDelete}
              onConfirm={confirmDelete}
              title="Delete Section"
              message={`Are you sure you want to delete "${deletingSection?.title}"? This will also delete all subsections within it.`}
              confirmText="Delete Section"
            />
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}