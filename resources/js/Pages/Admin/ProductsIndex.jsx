import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from "@inertiajs/react";
import { useEffect, useState, useMemo } from "react";
import useCrud from "@/Hooks/useCrud";
import ProductService from "@/Services/ProductService";
import ConfirmDialog from "@/Components/ConfirmDialog";
import ProductStats from "@/Components/Admin/Products/ProductStats";
import ProductsTable from "@/Components/Admin/Products/ProductsTable";
import { CreateProductModal, EditProductModal } from "@/Components/Admin/Products/ProductModals";

export default function ProductsIndex() {
  const apiMethods = useMemo(() => ({
    fetch: ProductService.getAll,
    create: ProductService.create,
    update: ProductService.update,
    delete: ProductService.delete,
  }), []);

  const {
    items: rawProducts,
    loading,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
  } = useCrud(apiMethods);

  const products = Array.isArray(rawProducts) ? rawProducts : (rawProducts?.data || []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const publishedCount = products.filter(p => p.is_published).length;
  const draftCount = products.length - publishedCount;

  // Create Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [isPublished, setIsPublished] = useState(true);

  // Edit Modal 
  const [editingProduct, setEditingProduct] = useState(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editPublished, setEditPublished] = useState(true);

  // Delete Modal 
  const [deletingProduct, setDeletingProduct] = useState(null);

  const handleCreate = async (e) => {
    e.preventDefault();
    const data = {
      name,
      slug: slug.trim() === "" ? null : slug.trim(),
      is_published: isPublished,
    };
    try {
      await createItem(data);
      setName("");
      setSlug("");
      setIsPublished(true);
      setShowCreateModal(false);
    } catch {

    }
  };

  const startEdit = (p) => {
    setEditingProduct(p);
    setEditName(p.name);
    setEditSlug(p.slug);
    setEditPublished(!!p.is_published);
  };

  const cancelEdit = () => {
    setEditingProduct(null);
    setEditName("");
    setEditSlug("");
    setEditPublished(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      await updateItem(editingProduct.id, {
        name: editName,
        slug: editSlug,
        is_published: editPublished,
      });
      cancelEdit();
    } catch {

    }
  };

  const handleDelete = async () => {
    if (!deletingProduct) return;
    try {
      await deleteItem(deletingProduct.id);
      setDeletingProduct(null);
    } catch {
      
    }
  };


  return (
    <AuthenticatedLayout header="Products">
      <Head title="Products" />

      <ProductStats
        products={products}
        publishedCount={publishedCount}
        draftCount={draftCount}
      />

      <div className="space-y-6">
        <ProductsTable
          products={products}
          loading={loading}
          onEdit={startEdit}
          onDelete={setDeletingProduct}
          onCreate={() => setShowCreateModal(true)}
        />
      </div>

      <CreateProductModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreate}
        name={name} setName={setName}
        slug={slug} setSlug={setSlug}
        isPublished={isPublished} setIsPublished={setIsPublished}
      />

      <EditProductModal
        show={!!editingProduct}
        onClose={cancelEdit}
        onUpdate={handleUpdate}
        editName={editName} setEditName={setEditName}
        editSlug={editSlug} setEditSlug={setEditSlug}
        editPublished={editPublished} setEditPublished={setEditPublished}
      />

      <ConfirmDialog
        isOpen={!!deletingProduct}
        onClose={() => setDeletingProduct(null)}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${deletingProduct?.name}"? This action cannot be undone.`}
        confirmText="Delete Product"
      />
    </AuthenticatedLayout>
  );
}