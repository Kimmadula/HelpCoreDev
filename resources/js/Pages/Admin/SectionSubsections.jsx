
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useToast } from "@/Contexts/ToastContext";
import ConfirmDialog from "@/Components/ConfirmDialog";
import SubsectionList from "@/Components/Admin/Subsections/SubsectionList";
import { CreateSubsectionModal, EditSubsectionModal } from "@/Components/Admin/Subsections/SubsectionModals";

export default function SectionSubsections({ sectionId, productId, sectionTitle, productTitle }) {
  const [subsections, setSubsections] = useState([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [isPublished, setIsPublished] = useState(true);

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPublished, setEditPublished] = useState(true);

  const [deletingId, setDeletingId] = useState(null);

  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const toast = useToast();

  const loadSubsections = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/admin/sections/${sectionId}/subsections`);
      setSubsections(Array.isArray(res.data) ? res.data : (res.data.data || []));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubsections();
  }, [sectionId]);

  const createSubsection = async (e) => {
    e.preventDefault();
    await axios.post(`/api/admin/sections/${sectionId}/subsections`, {
      title,
      is_published: isPublished,
    });
    setTitle("");
    setIsPublished(true);
    setShowCreateModal(false);
    await loadSubsections();
    toast.success("Subsection created successfully.");
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

  const updateSubsection = async (e) => {
    e.preventDefault();
    await axios.put(`/api/admin/subsections/${editingId}`, {
      title: editTitle,
      is_published: editPublished,
    });
    await loadSubsections();
    cancelEdit();
    toast.success("Subsection updated successfully.");
  };

  const startDelete = (id) => {
    setDeletingId(id);
  };

  const cancelDelete = () => {
    setDeletingId(null);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    await axios.delete(`/api/admin/subsections/${deletingId}`);
    await loadSubsections();
    if (editingId === deletingId) cancelEdit();
    cancelDelete();
    toast.success("Subsection deleted successfully.");
  };

  const move = async (index, direction) => {
    const newArr = [...subsections];
    const swapWith = direction === "up" ? index - 1 : index + 1;
    if (swapWith < 0 || swapWith >= newArr.length) return;

    // 1. Optimistic Update
    const previousSubsections = [...subsections];
    [newArr[index], newArr[swapWith]] = [newArr[swapWith], newArr[index]];
    setSubsections(newArr);

    try {
      // 2. Background Request
      await axios.put(`/api/admin/sections/${sectionId}/subsections/reorder`, {
        ordered_ids: newArr.map((s) => s.id),
      });
      // Success: No need to reload
    } catch (error) {
      console.error("Reorder failed:", error);
      // 3. Rollback
      setSubsections(previousSubsections);
      toast.error("Failed to reorder subsections. Please try again.");
    }
  };

  const deletingSubsection = subsections.find((s) => s.id === deletingId);

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
          <a href={`/admin/products/${productId}/sections`} className="text-gray-500 hover:text-blue-600 transition-colors">
            {sectionTitle}
          </a>
          <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-900 font-semibold">Subsections</span>
        </div>
      }
    >
      <Head title="Subsections" />

      <div className="py-2">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="space-y-6">

            <SubsectionList
              subsections={subsections}
              loading={loading}
              onMove={move}
              onEdit={startEdit}
              onDelete={startDelete}
              onCreate={() => setShowCreateModal(true)}
            />

          </div>
        </div>
      </div>

      <CreateSubsectionModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={createSubsection}
        title={title} setTitle={setTitle}
        isPublished={isPublished} setIsPublished={setIsPublished}
      />

      <EditSubsectionModal
        show={!!editingId}
        onClose={cancelEdit}
        onUpdate={updateSubsection}
        editTitle={editTitle} setEditTitle={setEditTitle}
        editPublished={editPublished} setEditPublished={setEditPublished}
      />

      {/* Delete Modal */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Subsection"
        message={`Are you sure you want to delete "${deletingSubsection?.title}"? This will also delete all content blocks within it.`}
        confirmText="Delete Subsection"
      />
    </AuthenticatedLayout>
  );
}