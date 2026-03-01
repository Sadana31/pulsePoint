import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function GlobalActions() {
  const [notifOpen, setNotifOpen] = useState(false);
  const navigate = useNavigate();

  // 1. ESC KEY LISTENER
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        setNotifOpen(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    
    // Cleanup the listener when the component unmounts
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <>

      {/* CHAT BUBBLE */}
      <button
        onClick={() => navigate("/chat")}
        className="fixed bottom-8 right-8 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-[#009999] text-2xl text-white shadow-2xl shadow-[#009999]/40 transition-all hover:scale-110 active:scale-90"
      >
        💬
      </button>
    </>
  );
}