import axios from 'axios';

const API_URL = '/api/visa-form-templates';

// Thiết lập interceptor để tự động chèn token vào header
const api = axios.create();
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

const getTemplates = () => {
    return api.get(API_URL);
};

const getTemplateById = (id) => {
    return api.get(`${API_URL}/${id}`);
};

const createTemplate = (data) => {
    return api.post(API_URL, data);
};

const updateTemplate = (id, data) => {
    return api.put(`${API_URL}/${id}`, data);
};

const deleteTemplate = (id) => {
    return api.delete(`${API_URL}/${id}`);
};

export default {
    getTemplates,
    getTemplateById,
    createTemplate,
    updateTemplate,
    deleteTemplate
};
