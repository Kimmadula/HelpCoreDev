import { useState, useCallback } from "react";
import { useToast } from "@/Contexts/ToastContext";

export default function useCrud(apiMethods) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    const fetchItems = useCallback(async (...args) => {
        if (!apiMethods.fetch) return;
        setLoading(true);
        try {
            const data = await apiMethods.fetch(...args);
            setItems(data);
            return data;
        } catch (err) {
            console.error(err);
            toast.error("Failed to load data.");
        } finally {
            setLoading(false);
        }
    }, [apiMethods, toast]);

    const createItem = useCallback(async (data) => {
        if (!apiMethods.create) return;
        try {
            const newItem = await apiMethods.create(data);
            setItems((prev) => [...prev, newItem]); 
            toast.success("Created successfully.");
            if (apiMethods.fetch) fetchItems();
            return newItem;
        } catch (err) {
            console.error(err);
            toast.error(err?.response?.data?.message || "Failed to create.");
            throw err;
        }
    }, [apiMethods, toast, fetchItems]);

    const updateItem = useCallback(async (id, data) => {
        if (!apiMethods.update) return;
        try {
            const updatedItem = await apiMethods.update(id, data);
            setItems((prev) => prev.map((item) => (item.id === id ? updatedItem : item)));
            toast.success("Updated successfully.");
            if (apiMethods.fetch) fetchItems();
            return updatedItem;
        } catch (err) {
            console.error(err);
            toast.error(err?.response?.data?.message || "Failed to update.");
            throw err;
        }
    }, [apiMethods, toast, fetchItems]);

    const deleteItem = useCallback(async (id) => {
        if (!apiMethods.delete) return;
        try {
            await apiMethods.delete(id);
            setItems((prev) => prev.filter((item) => item.id !== id));
            toast.success("Deleted successfully.");
        } catch (err) {
            console.error(err);
            toast.error(err?.response?.data?.message || "Failed to delete.");
            throw err;
        }
    }, [apiMethods, toast]);

    return {
        items,
        setItems,
        loading,
        fetchItems,
        createItem,
        updateItem,
        deleteItem,
    };
}
