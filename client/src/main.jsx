import ErrorBoundary from "./ErrorBoundary";
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './assets/styles/tablet.css'
import './assets/styles/mobile.css'
import './assets/styles/print.css'
import Swal from 'sweetalert2';

// Khởi tạo ghi đè tự động alert mặc định của trình duyệt để sửa lỗi popup chớp tắt
window.alert = function(message) {
  const isError = message && typeof message === 'string' && (message.toLowerCase().includes('lỗi') || message.toLowerCase().includes('bắt buộc') || message.toLowerCase().includes('vui lòng'));
  Swal.fire({
    title: isError ? 'Có lỗi xảy ra' : 'Thông báo',
    text: message,
    icon: isError ? 'warning' : 'info',
    confirmButtonText: 'Đã rõ',
    confirmButtonColor: '#3085d6',
  });
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary><App /></ErrorBoundary>
  </React.StrictMode>,
)
