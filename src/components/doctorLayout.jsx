import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import DoctorSidebar from "./doctorSidebar"; // The actual sidebar component

export default function DoctorLayout() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <DoctorSidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      <main
        className={`transition-all duration-500 ease-in-out pt-24 pb-12 ${
          isOpen ? "pl-80" : "pl-0"
        }`}
      >
        <div className="px-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
