import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import axios from "axios";
import { useEffect, useState } from "react";
import Skeleton from "@/Components/Skeleton";
import { useToast } from "@/Contexts/ToastContext";
import BlockItemWrapper from "@/Components/Admin/Blocks/BlockItemWrapper";
import AddArticleModal from "@/Components/Admin/AddArticleModal";

export default function SubsectionEditor({ subsectionId, sectionId, subsectionTitle, sectionTitle, productTitle }) {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [richTextContent, setRichTextContent] = useState("");
  const toast = useToast();

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

  const createBlock = async (e) => {
    e.preventDefault();

    const stripped = richTextContent.replace(/<[^>]*>/g, '').trim();
    if (!stripped && !richTextContent.includes('<img') && !richTextContent.includes('<iframe')) {
      toast.error("Please enter some content.");
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
    try {
      await axios.put(`/api/admin/blocks/${id}`, data);
      toast.success("Block updated successfully.");
      await loadBlocks();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update block.");
    }
  };

  const deleteBlock = async (id) => {
    if (!confirm("Delete this block?")) return;
    try {
      await axios.delete(`/api/admin/blocks/${id}`);
      await loadBlocks();
      toast.success("Block deleted successfully.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete block.");
    }
  };

  // Logic to prevent adding more blocks if one exists
  const hasBlock = blocks.length > 0;

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

      <div className="py-2">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Article</h3>
                {hasBlock && (
                  <p className="mt-1 text-sm text-gray-500">
                    Maximum 1 article allowed per subsection.
                  </p>
                )}
              </div>
              {!hasBlock && (
                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-md hover:shadow-lg"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Article
                </button>
              )}
            </div>

            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-64 w-full rounded-lg" count={1} />
              </div>
            ) : blocks.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h4 className="mt-4 text-lg font-medium text-gray-900">No content yet</h4>
                <p className="mt-2 text-sm text-gray-600">Add a content block to get started.</p>
                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Content Block
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {blocks.map((b) => (
                  <BlockItemWrapper
                    key={b.id}
                    block={b}
                    onDelete={deleteBlock}
                    onUpdate={updateBlock}
                  />
                ))}
              </div>
            )}
            <div id="bottom-of-blocks" className="h-4"></div>
          </div>
        </div>
      </div>

      <AddArticleModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={createBlock}
        richTextContent={richTextContent}
        setRichTextContent={setRichTextContent}
      />

    </AuthenticatedLayout >
  );
}