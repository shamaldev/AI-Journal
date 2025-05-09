import axios from 'axios';
import checkToken from './checkToken';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Assuming your backend is running on the same domain or you'll configure proxy
  withCredentials: true,
});



// api.interceptors.request.use(
//     (config) => {
//       const token = localStorage.getItem('token');
//       if (token) {
//         config.headers.Authorization = `Bearer ${token}`;
//       }
//       return config;
//     },
//     (error) => {
//       return Promise.reject(error);
//     }
//   );

api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        if (checkToken(token)) {
          console.log('Token expired during API request. Logging out.');
          // Perform logout actions here (e.g., clear localStorage, redirect)
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          localStorage.removeItem('username');
          // Programmatically redirect to login (you might need to handle this carefully outside the component context)
          window.location.href = '/login'; // Simplest way for redirection outside component
          return Promise.reject('Token expired. Please log in again.'); // Cancel the request
        }
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

export default api;