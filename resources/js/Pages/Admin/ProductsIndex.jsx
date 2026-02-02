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

  // CREATE
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [isPublished, setIsPublished] = useState(true);

  // EDIT
  const [editingId, setEditingId] = useState(null);
  const editingProduct = useMemo(
    () => products.find((p) => p.id === editingId) ?? null,
    [products, editingId]
  );

  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editPublished, setEditPublished] = useState(true);

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
      await loadProducts();
    } catch (err) {
      alert(err?.response?.data?.message ?? "Failed to create product");
      console.error(err);
    }
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

  const deleteProduct = async (id) => {
    const ok = confirm("Delete this product? (Sections/pages/blocks will also be deleted)");
    if (!ok) return;

    try {
      await ensureSanctumCsrf();
      await axios.delete(`/api/admin/products/${id}`);
      await loadProducts();
      if (editingId === id) cancelEdit();
    } catch (err) {
      alert(err?.response?.data?.message ?? "Failed to delete product");
      console.error(err);
    }
  };

  return (
    <AuthenticatedLayout
      header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Admin • Products</h2>}
    >
      <Head title="Admin Products" />

      <div className="py-8">
        <div className="max-w-6xl mx-auto sm:px-6 lg:px-8 space-y-6">
          {/* Create */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="font-semibold mb-4">Add Product</h3>
            <form onSubmit={createProduct} className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input
                className="border rounded px-3 py-2"
                placeholder="Product name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <input
                className="border rounded px-3 py-2"
                placeholder="Slug (optional, auto from name)"
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
              <button className="bg-black text-white rounded px-4 py-2">
                Create
              </button>
            </form>
          </div>

          {/* List */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Products</h3>
              <button
                className="text-sm underline"
                onClick={loadProducts}
                disabled={loading}
              >
                Refresh
              </button>
            </div>

            {loading ? (
              <div>Loading…</div>
            ) : products.length === 0 ? (
              <div>No products yet.</div>
            ) : (
              <div className="divide-y">
                {products.map((p) => (
                  <div key={p.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{p.name}</div>
                      <div className="text-sm text-gray-600 truncate">
                        slug: <span className="font-mono">{p.slug}</span> •{" "}
                        {p.is_published ? "Published" : "Draft"}
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        className="border rounded px-3 py-1 text-sm"
                        onClick={() => startEdit(p)}
                      >
                        Edit
                      </button>
                      <button
                        className="border rounded px-3 py-1 text-sm text-red-600"
                        onClick={() => deleteProduct(p.id)}
                      >
                        Delete
                      </button>
                      {/* Manage Sections */}
                      <a href={`/admin/products/${p.id}/sections`} className="border rounded px-3 py-1 text-sm"
                        >Sections</a>

                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Edit */}
          {editingProduct && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="font-semibold mb-4">Edit Product</h3>
              <form onSubmit={updateProduct} className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <input
                  className="border rounded px-3 py-2"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
                <input
                  className="border rounded px-3 py-2"
                  value={editSlug}
                  onChange={(e) => setEditSlug(e.target.value)}
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
                  <button className="bg-black text-white rounded px-4 py-2">
                    Save
                  </button>
                  <button
                    type="button"
                    className="border rounded px-4 py-2"
                    onClick={cancelEdit}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
