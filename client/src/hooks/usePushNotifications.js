import { useState, useCallback } from 'react';
import axios from 'axios';

const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');
  
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
  
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
};

const usePushNotifications = (token) => {
    const [isSubscribing, setIsSubscribing] = useState(false);

    const requestSubscription = useCallback(async () => {
        if (!token) return alert('Vui lòng đăng nhập trước!');
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            return alert('Trình duyệt của bạn không hỗ trợ thông báo đẩy!');
        }

        setIsSubscribing(true);
        try {
            // Request permission directly from user click
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                setIsSubscribing(false);
                return alert('Bạn đã từ chối cấp quyền thông báo. Vui lòng vào Cài đặt trình duyệt để mở lại.');
            }

            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('Service Worker registered with scope:', registration.scope);

            // Chờ Service Worker kích hoạt hoàn toàn
            const activeRegistration = await navigator.serviceWorker.ready;

            const subscribeOptions = {
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY)
            };
            
            const pushSubscription = await activeRegistration.pushManager.subscribe(subscribeOptions);
            
            // Send subscription to backend
            await axios.post('/api/notifications/subscribe', {
                subscription: pushSubscription
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            alert('🎉 Đã bật thông báo đẩy thành công!');
        } catch (error) {
            console.error('Error subscribing to push notifications:', error);
            alert('Lỗi đăng ký thông báo: ' + (error.message || 'Unknown error'));
        } finally {
            setIsSubscribing(false);
        }
    }, [token]);

    return { requestSubscription, isSubscribing };
};

export default usePushNotifications;
