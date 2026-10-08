import { useEffect, useRef } from 'react';

// Stack lưu trữ các handler đóng modal theo thứ tự LIFO (modal/drawer mở sau cùng thì đóng trước)
const escapeStack = [];

if (typeof window !== 'undefined') {
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.key === 'Esc') {
      // Nếu sự kiện đã được element khác xử lý (ví dụ: react-select dropdown menu đang mở)
      if (e.defaultPrevented) return;

      if (escapeStack.length > 0) {
        const topHandler = escapeStack[escapeStack.length - 1];
        if (typeof topHandler === 'function') {
          e.preventDefault();
          e.stopPropagation();
          topHandler(e);
        }
      }
    }
  });
}

/**
 * Hook lắng nghe phím ESC để đóng modal/drawer/popup.
 * Hỗ trợ xếp chồng (stack LIFO): popup trên cùng sẽ được đóng trước.
 * @param {Function} handler Callback thực hiện đóng popup
 * @param {boolean} enabled Điều kiện kích hoạt (mặc định: true)
 */
export function useEscapeKey(handler, enabled = true) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!enabled) return;

    const currentCallback = (e) => {
      if (handlerRef.current) {
        handlerRef.current(e);
      }
    };

    escapeStack.push(currentCallback);

    return () => {
      const index = escapeStack.indexOf(currentCallback);
      if (index > -1) {
        escapeStack.splice(index, 1);
      }
    };
  }, [enabled]);
}

export default useEscapeKey;
