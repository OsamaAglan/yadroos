import axios from 'axios';

//const baseURL = process.env.REACT_APP_API_BASE_URL;
//const baseURL = process.env.REACT_APP_API_URL || 'https://yadroosdev.com-eg.net/api';
const baseURL = 'https://yadroosdev.com-eg.net/api';


const axiosInstance = axios.create({
  baseURL,
});

// إرفاق التوكن تلقائيًا مع كل طلب
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
  );

  

export default axiosInstance;
