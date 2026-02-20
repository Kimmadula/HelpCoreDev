import { useState, useCallback } from 'react';
import axios from 'axios';

const uploadImage = async (file, view) => {
    // 2MB limit
    if (file.size > 2 * 1024 * 1024) {
        alert("Image size exceeds the 2MB limit.");
        return false;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
        const res = await axios.post("/api/admin/uploads/images", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        if (res.data && res.data.path) {
            const url = (res.data.path.startsWith('http') || res.data.path.startsWith('/storage'))
                ? res.data.path
                : `/storage/${res.data.path}`;

            const node = view.state.schema.nodes.image.create({ src: url });
            const transaction = view.state.tr.replaceSelectionWith(node);
            view.dispatch(transaction);
            return true;
        }
    } catch (error) {
        console.error("Image upload failed:", error);
        alert("Failed to upload image. Please try again.");
    }
    return false;
};

export const useImageUpload = () => {
    const [isUploading, setIsUploading] = useState(false);

    const onImageUpload = useCallback(async (file, view) => {
        setIsUploading(true);
        try {
            await uploadImage(file, view);
        } finally {
            setIsUploading(false);
        }
    }, []);

    return { isUploading, onImageUpload };
};
