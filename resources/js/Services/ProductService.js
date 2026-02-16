import ApiService from "./ApiService";

const ProductService = {
    getAll: async () => {
        const response = await ApiService.get("/api/admin/products");
        return response.data || response;
    },
    create: async (data) => {
        const response = await ApiService.post("/api/admin/products", data);
        return response.data || response;
    },
    update: async (id, data) => {
        const response = await ApiService.put(`/api/admin/products/${id}`, data);
        return response.data || response;
    },
    delete: (id) => ApiService.delete(`/api/admin/products/${id}`),
};

export default ProductService;
