import ApiService from "./ApiService";

const ProductService = {
    getAll: () => ApiService.get("/api/admin/products"),
    create: (data) => ApiService.post("/api/admin/products", data),
    update: (id, data) => ApiService.put(`/api/admin/products/${id}`, data),
    delete: (id) => ApiService.delete(`/api/admin/products/${id}`),
};

export default ProductService;
