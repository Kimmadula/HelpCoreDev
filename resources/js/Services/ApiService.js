import axios from "axios";

const ApiService = {
    get: async (url, params = {}) => {
        const response = await axios.get(url, { params });
        return response.data;
    },

    post: async (url, data) => {
        const response = await axios.post(url, data);
        return response.data;
    },

    put: async (url, data) => {
        const response = await axios.put(url, data);
        return response.data;
    },

    delete: async (url) => {
        const response = await axios.delete(url);
        return response.data;
    },
};

export default ApiService;
