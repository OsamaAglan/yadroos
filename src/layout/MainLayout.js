import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Admin/Navbar";
import { getUserFromToken } from "../utils/auth";

const MainLayout = ({ children }) => {
  const user = getUserFromToken();
  const role = user?.role;
  const personId = user?.personId;
  const isAuth = personId > 0;

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="bg-gray-100 min-h-screen relative overflow-x-hidden">
      {/* ✅ طبقة التعتيم الخلفية للموبايل عند فتح القائمة الجانبية */}
      {isAuth && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-xs transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* ✅ Sidebar يظهر فقط لو الشخص مسجل */}
      {isAuth && (
        <aside
          className={`fixed top-0 right-0 h-screen w-64 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"}`}
        >
          <Sidebar
            role={role}
            personId={personId}
            onClose={() => setSidebarOpen(false)}
          />
        </aside>
      )}

      {/* ✅ باقي الصفحة ومحتواها */}
      <div
        className={`flex flex-col min-h-screen transition-all duration-300 ${
          isAuth ? "md:mr-64 mr-0" : "mr-0"
        }`}
      >
        {/* ✅ Navbar */}
        <header className="relative z-30">
          <Navbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
        </header>

        {/* ✅ محتوى الصفحة (متجاوب مع المسافات للشاشات الصغيرة والكبيرة) */}
        <main className="flex-1 p-3 sm:p-5 md:p-6 overflow-y-auto pt-20 sm:pt-24 max-w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
