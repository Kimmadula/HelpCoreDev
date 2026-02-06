
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import axios from "axios";
import { useEffect, useState } from "react";

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

  const loadSubsections = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/admin/sections/${sectionId}/subsections`);
      setSubsections(res.data);
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
  };

  const move = async (index, direction) => {
    const newArr = [...subsections];
    const swapWith = direction === "up" ? index - 1 : index + 1;
    if (swapWith < 0 || swapWith >= newArr.length) return;

    [newArr[index], newArr[swapWith]] = [newArr[swapWith], newArr[index]];
    setSubsections(newArr);

    await axios.put(`/api/admin/sections/${sectionId}/subsections/reorder`, {
      ordered_ids: newArr.map((s) => s.id),
    });

    await loadSubsections();
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
      <Head title="Admin • Edit Subsections" />

      <div className="py-8">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="space-y-6">
            {/* Back Navigation */}
            <div>
              <a
                href={`/admin/products/${productId}/sections`}
                className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Sections
              </a>
            </div>

            {/* Create Subsection Button (replaces inline form) */}


            {/* Create Modal */}
            {showCreateModal && (
              <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex min-h-screen items-center justify-center p-4">
                  <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowCreateModal(false)}></div>

                  <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden transform transition-all">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 w-12 h-12 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </div>
                          <div className="ml-4">
                            <h3 className="text-xl font-bold text-white">Create Subsection</h3>
                            <p className="text-sm text-blue-100 mt-0.5">Add a new subsection to this section</p>
                          </div>
                        </div>
                        <button onClick={() => setShowCreateModal(false)} className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <form onSubmit={createSubsection} className="p-6">
                      <div className="space-y-5">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Subsection Title <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
                            placeholder="Enter subsection title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                          />
                        </div>

                        <div className="pt-2">
                          <label className="inline-flex items-center cursor-pointer group">
                            <div className="relative">
                              <input
                                type="checkbox"
                                checked={isPublished}
                                onChange={(e) => setIsPublished(e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                            </div>
                            <span className="ml-3 text-base font-medium text-gray-700 group-hover:text-gray-900">
                              Publish immediately
                            </span>
                          </label>
                        </div>
                      </div>

                      <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
                        <button
                          type="button"
                          onClick={() => setShowCreateModal(false)}
                          className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-lg hover:shadow-xl"
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Create Subsection
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* Subsections List */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">All Subsections</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {loading ? "Loading..." : `${subsections.length} subsection${subsections.length !== 1 ? 's' : ''} total`}
                  </p>
                </div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-md hover:shadow-lg"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Subsection
                </button>
              </div>

              {loading ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-blue-600"></div>
                  <p className="mt-4 text-gray-600">Loading subsections...</p>
                </div>
              ) : subsections.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  <h4 className="mt-4 text-lg font-medium text-gray-900">No subsections yet</h4>
                  <p className="mt-2 text-sm text-gray-600">Get started by creating your first subsection above.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {subsections.map((s, idx) => (
                    <div
                      key={s.id}
                      className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md hover:border-gray-300 transition-all"
                    >
                      <div className="p-5">
                        <div className="flex items-center justify-between gap-4">
                          {/* Subsection Info */}
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
                                disabled={idx === subsections.length - 1}
                                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                title="Move down"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                            </div>

                            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                              {idx + 1}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-3">
                                <h4 className="text-base font-semibold text-gray-900 truncate">
                                  {s.title}
                                </h4>
                                <span
                                  className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${s.is_published
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-600'
                                    }`}
                                >
                                  {s.is_published ? 'Published' : 'Draft'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <a
                              href={`/admin/subsections/${s.id}/edit`}
                              className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            >
                              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit Content
                            </a>

                            <button
                              onClick={() => startEdit(s)}
                              className="inline-flex items-center px-3 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            >
                              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                              Rename
                            </button>

                            <button
                              onClick={() => startDelete(s.id)}
                              className="inline-flex items-center px-3 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-red-50 hover:border-red-300 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                            >
                              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {
        editingId && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
              <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={cancelEdit}></div>

              <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden transform transition-all">
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-12 h-12 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-xl font-bold text-white">Rename Subsection</h3>
                        <p className="text-sm text-orange-100 mt-0.5">Update subsection information</p>
                      </div>
                    </div>
                    <button onClick={cancelEdit} className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <form onSubmit={updateSubsection} className="p-6">
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Subsection Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all text-base"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        required
                      />
                    </div>

                    <div className="pt-2">
                      <label className="inline-flex items-center cursor-pointer group">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={editPublished}
                            onChange={(e) => setEditPublished(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-amber-500"></div>
                        </div>
                        <span className="ml-3 text-base font-medium text-gray-700 group-hover:text-gray-900">
                          Published
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all shadow-lg hover:shadow-xl"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )
      }

      {/* Delete Modal */}
      {
        deletingSubsection && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
              <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={cancelDelete}></div>

              <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all">
                <div className="bg-gradient-to-r from-red-500 to-rose-600 px-6 py-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-12 h-12 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-xl font-bold text-white">Delete Subsection</h3>
                      <p className="text-sm text-red-100 mt-0.5">This action cannot be undone</p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg mb-6">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-red-800">
                          Warning: All content/blocks will also be deleted
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <p className="text-sm text-gray-600 mb-2">You are about to delete:</p>
                    <p className="text-lg font-bold text-gray-900">{deletingSubsection.title}</p>
                  </div>

                  <p className="text-sm text-gray-600">
                    Are you absolutely sure you want to delete this subsection?
                  </p>
                </div>

                <div className="bg-gray-50 px-6 py-4 flex gap-3">
                  <button
                    type="button"
                    onClick={cancelDelete}
                    className="flex-1 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmDelete}
                    className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white font-semibold rounded-lg hover:from-red-700 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all shadow-lg hover:shadow-xl"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete Subsection
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }
    </AuthenticatedLayout>
  );
}