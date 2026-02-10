import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";

async function ensureSanctumCsrf() {
  await axios.get("/sanctum/csrf-cookie");
}

export default function ProductsIndex() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [isPublished, setIsPublished] = useState(true);

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editPublished, setEditPublished] = useState(true);

  const [deletingId, setDeletingId] = useState(null);

  // Derived State
  const editingProduct = useMemo(() => products.find(p => p.id === editingId), [products, editingId]);
  const deletingProduct = useMemo(() => products.find(p => p.id === deletingId), [products, deletingId]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/admin/products");
      setProducts(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const createProduct = async (e) => {
    e.preventDefault();
    try {
      await ensureSanctumCsrf();
      await axios.post("/api/admin/products", {
        name,
        slug: slug.trim() === "" ? null : slug.trim(),
        is_published: isPublished,
      });

      setName("");
      setSlug("");
      setIsPublished(true);
      setShowCreateModal(false);
      await loadProducts();
    } catch (err) {
      alert(err?.response?.data?.message ?? "Failed to create product");
      console.error(err);
    }
  };

  const startEdit = (p) => {
    setEditingId(p.id);
    setEditName(p.name);
    setEditSlug(p.slug);
    setEditPublished(!!p.is_published);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditSlug("");
    setEditPublished(true);
  };

  const startDelete = (p) => {
    setDeletingId(p.id);
  };

  const cancelDelete = () => {
    setDeletingId(null);
  };

  const updateProduct = async (e) => {
    e.preventDefault();
    if (!editingId) return;

    try {
      await ensureSanctumCsrf();
      await axios.put(`/api/admin/products/${editingId}`, {
        name: editName,
        slug: editSlug,
        is_published: editPublished,
      });

      await loadProducts();
      cancelEdit();
    } catch (err) {
      alert(err?.response?.data?.message ?? "Failed to update product");
      console.error(err);
    }
  };

  const confirmDelete = async () => {
    if (!deletingId) return;

    try {
      await ensureSanctumCsrf();
      await axios.delete(`/api/admin/products/${deletingId}`);
      await loadProducts();
      cancelDelete();
    } catch (err) {
      alert(err?.response?.data?.message ?? "Failed to delete product");
      console.error(err);
    }
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-xl text-gray-800 leading-tight">
            Products Management
          </h2>
        </div>
      }
    >
      <Head title="Products" />

      <div className="py-8">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="space-y-6">

            {/* Create Product Modal */}
            {showCreateModal && (
              <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex min-h-screen items-center justify-center p-4">
                  {/* Backdrop */}
                  <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowCreateModal(false)}></div>

                  {/* Modal */}
                  <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden transform transition-all">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 w-12 h-12 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </div>
                          <div className="ml-4">
                            <h3 className="text-xl font-bold text-white">Create Product</h3>
                            <p className="text-sm text-blue-100 mt-0.5">Add a new product to your catalog</p>
                          </div>
                        </div>
                        <button onClick={() => setShowCreateModal(false)} className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Body */}
                    <form onSubmit={createProduct} className="p-6">
                      <div className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Product Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
                              placeholder="Enter product name"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Slug <span className="text-gray-400 text-xs font-normal">(optional)</span>
                            </label>
                            <input
                              type="text"
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono text-sm"
                              placeholder="auto-generated from name"
                              value={slug}
                              onChange={(e) => setSlug(e.target.value)}
                            />
                          </div>
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
                          Create Product
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* Products Grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Products</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {loading ? "Loading..." : `${products.length} product${products.length !== 1 ? 's' : ''} total`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-md hover:shadow-lg"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Product
                </button>
              </div>

              {loading ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-blue-600"></div>
                  <p className="mt-4 text-gray-600">Loading products...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <h4 className="mt-4 text-lg font-medium text-gray-900">No products yet</h4>
                  <p className="mt-2 text-sm text-gray-600">Get started by creating your first product above.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {products.map((p) => (
                    <div
                      key={p.id}
                      className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md hover:border-gray-300 transition-all"
                    >
                      {/* Card Header */}
                      <div className="px-5 py-4 border-b border-gray-100">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-base font-semibold text-gray-900 truncate">
                              {p.name}
                            </h4>
                            <p className="text-sm text-gray-500 font-mono truncate mt-0.5">
                              {p.slug}
                            </p>
                          </div>
                          <span
                            className={`flex-shrink-0 inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${p.is_published
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                              }`}
                          >
                            {p.is_published ? 'Published' : 'Draft'}
                          </span>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-5">
                        <div className="flex flex-col gap-2">
                          {/* Sections Button */}
                          <a
                            href={`/admin/products/${p.id}/sections`}
                            className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                            </svg>
                            Sections
                          </a>

                          {/* Action Buttons */}
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => startEdit(p)}
                              className="inline-flex items-center justify-center px-3 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-green-50 hover:border-green-300 hover:text-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            >
                              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit
                            </button>

                            <button
                              onClick={() => startDelete(p)}
                              className="inline-flex items-center justify-center px-3 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-red-50 hover:border-red-300 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
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
      {editingProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={cancelEdit}
            ></div>

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden transform transition-all">
              {/* Header */}
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-12 h-12 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-xl font-bold text-white">Edit Product</h3>
                      <p className="text-sm text-orange-100 mt-0.5">Update product information</p>
                    </div>
                  </div>
                  <button
                    onClick={cancelEdit}
                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Body */}
              <form onSubmit={updateProduct} className="p-6">
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Product Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all text-base"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Slug <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all font-mono text-sm"
                      value={editSlug}
                      onChange={(e) => setEditSlug(e.target.value)}
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

                {/* Footer */}
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
      )}

      {/* Delete Confirmation Modal */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={cancelDelete}
            ></div>

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all">
              {/* Header */}
              <div className="bg-gradient-to-r from-red-500 to-rose-600 px-6 py-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-12 h-12 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-bold text-white">Delete Product</h3>
                    <p className="text-sm text-red-100 mt-0.5">This action cannot be undone</p>
                  </div>
                </div>
              </div>

              {/* Body */}
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
                        Warning: All related data will be permanently deleted
                      </p>
                      <p className="mt-1 text-sm text-red-700">
                        This includes all sections, pages, and blocks associated with this product.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-600 mb-2">You are about to delete:</p>
                  <p className="text-lg font-bold text-gray-900">{deletingProduct.name}</p>
                  <p className="text-sm text-gray-500 font-mono mt-1">{deletingProduct.slug}</p>
                </div>

                <p className="text-sm text-gray-600">
                  Are you absolutely sure you want to delete this product? This action cannot be undone.
                </p>
              </div>

              {/* Footer */}
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
                  Delete Product
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AuthenticatedLayout>
  );
}