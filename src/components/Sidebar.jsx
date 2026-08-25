// src/components/Sidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import CloseIcon from "@mui/icons-material/Close";
import { IconButton } from "@mui/material";

const Sidebar = ({ role, personId, onClose }) => {
  const linkStyle = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium text-sm sm:text-base ${
      isActive
        ? "text-blue-600 font-bold bg-blue-50 border-r-4 border-blue-600 shadow-xs"
        : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
    }`;

  const id = personId;
  const gradeId = 5;
  const term = 1;

  // روابط المدرس
  const teacherLinks = [
    { to: "/main-page", label: "الصفحة الرئيسية" },
    { to: "/teacher-dashboard", label: "لوحة التحكم" },
    { to: "/teacher-groups", label: "المجموعات" },
    { to: `/teacher-students/${id}`, label: "الطلاب" },
    { to: "/teacher-settings", label: "الإعدادات" },
    { to: "/teacher-group-analytics", label: "تحليل المجموعات" },
    { to: `/teachers-profile/${id}`, label: "الملف الشخصي" },
  ];

  // روابط الطالب
  const studentLinks = [
    { to: "/main-page", label: "الصفحة الرئيسية" },
    { to: "/student-dashboard", label: "لوحة التحكم" },
    { to: `/student-profile/${id}`, label: "الملف الشخصي" },
    { to: `/student-groups/${id}/${gradeId}/${term}`, label: "مجموعاتي" },
  ];

  // نحدد الروابط حسب الدور
  const links = role === "مدرس" ? teacherLinks : studentLinks;

  return (
    <div className="w-64 bg-white shadow-xl h-full flex flex-col justify-between overflow-y-auto">
      {/* الجزء العلوي: العنوان وزر الإغلاق في الموبايل */}
      <div>
        <div className="p-4 border-b flex items-center justify-between">
          <div className="text-xl font-extrabold text-blue-600">
            <span className="text-yellow-500">Ya</span>Droos
          </div>
          {/* زر إغلاق القائمة في الشاشات الصغيرة */}
          <div className="md:hidden">
            <IconButton
              size="small"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-800"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </div>
        </div>

        {/* قائمة الروابط */}
        <nav className="p-3">
          <ul className="space-y-1 text-right">
            {links.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  className={linkStyle}
                  onClick={() => {
                    if (onClose) onClose();
                  }}
                >
                  <span>{link.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* الجزء السفلي */}
      <div className="p-4 border-t text-center text-xs text-gray-400">
        منصة يادُروس التعليمية &copy; 2026
      </div>
    </div>
  );
};

export default Sidebar;
