import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

window.axios.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response ? error.response.status : null;

        if (status === 401) {
            window.location.href = '/login';
        } else if (status === 419) {
            window.location.reload();
        } else if (status === 500) {
            alert('Something went wrong on the server. Please try again later.');
        }

        return Promise.reject(error);
    }
);
