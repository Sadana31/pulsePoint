import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import GlobalActions from "./GlobalActions";

export default function Layout() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 transition-all duration-500 ease-in-out">
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      <GlobalActions />

      <main
        className={`transition-all duration-500 ease-in-out pt-24 pb-12 ${
          isOpen ? "pl-80" : "pl-0"
        }`}
      >
        <div className="w-full px-10 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
