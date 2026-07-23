import { useEffect, useState } from "react";

export interface ToastMessage {
  id: number;
  text: string;
  type: "info" | "success" | "error";
}

interface ToastProps {
  message: ToastMessage;
  onDismiss: (id: number) => void;
}

export default function Toast({ message, onDismiss }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger enter animation on next frame
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDismiss(message.id), 200);
    }, 2500);
    return () => clearTimeout(timer);
  }, [message.id, onDismiss]);

  const bgColor =
    message.type === "error"
      ? "rgba(239, 68, 68, 0.95)"
      : message.type === "success"
        ? "rgba(34, 197, 94, 0.95)"
        : "rgba(30, 41, 59, 0.95)";

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg
                 text-sm font-medium shadow-lg pointer-events-none
                 transition-[opacity,transform] duration-200"
      style={{
        backgroundColor: bgColor,
        color: "#fff",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(8px)",
        ...(!visible && { transitionDuration: "150ms" }),
      }}
    >
      {message.text}
    </div>
  );
}
