import React from "react";
import { Link, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export default function Sidebar({ isOpen, setIsOpen }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [userName, setUserName] = useState("");

  const NAV_ITEMS = [
    { label: "Dashboard", path: "/dashboard", icon: "🏠" },
    { label: "PulseBot Assistant", path: "/chat", icon: "🤖" },
    { label: "Book an Appointment", path: "/appointment", icon: "📅" },
    { label: "My Appointments ", path: "/myvisits", icon: "📋" },
    { label: "Medical Library", path: "/library", icon: "📚" },
    { label: "Message a Doctor", path: "/messageDoctor", icon: "🥼" },
    { label: "Psychatric Counselling", path: "/psychatric", icon: "🧠" },
  ];

  // FETCH USER NAME
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) return;

      try {
        const snapshot = await getDocs(
          query(collection(db, "patients"), where("email", "==", user.email)),
        );

        if (!snapshot.empty) {
          const data = snapshot.docs[0].data();
          setUserName(data.name);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    });

    return () => unsubscribe();
  }, []);
  // GENERATE INITIALS
  const initials = userName
    ? userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "PT";

  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-full bg-white transition-all duration-500 ease-in-out border-r border-slate-200 shadow-[4px_0_24px_rgba(0,0,0,0.02)] overflow-hidden ${
        isOpen ? "w-80" : "w-20"
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="h-20 flex items-center px-5 shrink-0">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex h-10 w-10 mb-1 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-[#009999] transition-all"
          >
            <div className="flex flex-col gap-1">
              <span
                className={`h-0.5 bg-black transition-all ${isOpen ? "w-5" : "w-4"}`}
              />
              <span className="h-0.5 w-5 bg-black" />
              <span
                className={`h-0.5 bg-black transition-all ${isOpen ? "w-5" : "w-3"}`}
              />
            </div>
          </button>
        </div>

        <div
          className={`px-4 overflow-hidden shrink-0 transition-all duration-500 ${
            isOpen ? "h-20 opacity-100" : "h-0 opacity-0 mb-0"
          }`}
        >
          <div className="flex items-center gap-4 min-w-[280px]">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#009999] text-2xl text-white shadow-lg shadow-[#009999]/20">
              🩺
            </div>
            <div className="flex flex-col">
              <h2 className="text-xl font-semibold tracking-tighter text-black uppercase">
                PulsePoint
              </h2>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#009999]">
                Clinical Intelligence
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-2 overflow-y-auto overflow-x-hidden">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-6 rounded-2xl h-14 transition-all duration-300 group ${
                  isActive
                    ? "bg-[#009999]/5 text-[#009999]"
                    : "text-black hover:bg-slate-50"
                }`}
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center text-xl">
                  {item.icon}
                </div>

                <span
                  className={`text-base font-semibold whitespace-nowrap transition-opacity duration-300 ${
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-100 shrink-0 space-y-3">
          <Link
            to="/profile"
            className="flex items-center gap-4 rounded-2xl bg-slate-50 h-16 overflow-hidden transition-all hover:bg-slate-100 active:scale-95 group"
          >
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#009999] font-black text-white text-base shadow-lg shadow-[#009999]/20 group-hover:brightness-110">
              {initials}
            </div>

            <div
              className={`flex flex-col transition-all duration-300 ${
                isOpen
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-2 pointer-events-none"
              }`}
            >
              <span className="text-sm font-black text-black tracking-tight">
                {userName || "Patient"}
              </span>
              <span className="text-[11px] font-bold text-[#009999] uppercase tracking-[0.2em]">
                Patient Account
              </span>
            </div>
          </Link>

          <button
            onClick={async () => {
              try {
                await signOut(auth);
                navigate("/ ");
              } catch (error) {
                console.error("Logout error:", error);
              }
            }}
            className={`w-full flex items-center gap-4 rounded-2xl h-14 bg-red-50 text-red-600 hover:bg-red-100 transition-all active:scale-95 ${
              isOpen ? "px-4 justify-start" : "justify-center"
            }`}
          >
            <div className="flex h-10 w-10 items-center justify-center text-lg">
              🚪
            </div>
            <span
              className={`${isOpen ? "block" : "hidden"} font-bold text-sm`}
            >
              Log Out
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
}
