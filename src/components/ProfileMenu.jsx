// ProfileMenu.jsx
import React, { useState } from "react";
import {
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Typography,
  Box,
} from "@mui/material";
import { Settings, Logout, Login, PersonAdd } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import defaultAvatar from "../assets/profile.jpg";
import { getFullImageUrl } from "../utils/getFullImageUrl";

const ProfileMenu = ({ userData, role }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  // ✅ التحقق من تسجيل الدخول
  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;

  // 👇 تحديد الاسم حسب الدور
  const getNameByRole = () => {
    if (!isLoggedIn) return "زائر"; // في حالة عدم تسجيل الدخول
    switch (role) {
      case "مدرس":
        return userData?.teacherName || "مدرس";
      case "طالب":
        return userData?.studentName || "طالب";
      case "متابع":
        return userData?.parentName || "متابع";
      case "مدير":
        return userData?.userName || "مدير";
      default:
        return "مستخدم";
    }
  };

  // 👇 تحديد الصورة
  const getProfilePic = () => {
    const pic = userData?.profilePicture;
    return pic ? getFullImageUrl(pic) : defaultAvatar;
  };

  // 👇 رابط التعديل
  const getEditLink = () => {
    const id =
      userData?.teacherId ||
      userData?.studentId ||
      userData?.parentId ||
      userData?.userId;

    switch (role) {
      case "مدرس":
        return `/teachers-profile/${id}`;
      case "طالب":
        return `/student-profile/${id}`;
      case "متابع":
        return `/parents/${id}`;
      case "مدير":
        return `/admin/settings`;
      default:
        return "/";
    }
  };

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    handleMenuClose();
    navigate("/login");
  };

  return (
    <>
      {/* ✅ أيقونة البروفايل */}
      <IconButton onClick={handleMenuOpen} sx={{ ml: 2 }}>
        <Avatar src={getProfilePic()} alt="Profile" />
      </IconButton>

      {/* ✅ القائمة المنسدلة */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {isLoggedIn ? "مرحبًا 👋" : "سجّل الدخول للاستفادة من المزايا"}
          </Typography>
          <Typography variant="subtitle1" fontWeight="bold" noWrap>
            {getNameByRole()}
          </Typography>
        </Box>
        <Divider />

        {/* ✅ زر تعديل البيانات يظهر فقط لو فيه تسجيل دخول */}
        {isLoggedIn && (
          <MenuItem
            onClick={() => {
              handleMenuClose();
              navigate(getEditLink());
            }}
          >
            <Settings fontSize="small" sx={{ ml: 1, color: "#1565c0" }} />
            تعديل البيانات
          </MenuItem>
        )}

        {/* ✅ زر تسجيل الدخول / تسجيل الخروج */}
        {isLoggedIn ? (
          <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
            <Logout fontSize="small" sx={{ ml: 1 }} /> تسجيل الخروج
          </MenuItem>
        ) : (
          <MenuItem
            onClick={() => {
              handleMenuClose();
              navigate("/login");
            }}
          >
            <Login fontSize="small" sx={{ ml: 1, color: "#2e7d32" }} /> تسجيل الدخول
          </MenuItem>
        )}

        {/* ✅ زر تسجيل مستخدم جديد */}
        {!isLoggedIn && (
          <MenuItem
            onClick={() => {
              handleMenuClose();
              navigate("/register");
            }}
          >
            <PersonAdd fontSize="small" sx={{ ml: 1, color: "#1565c0" }} /> تسجيل مستخدم جديد
          </MenuItem>
        )}
      </Menu>
    </>
  );
};

export default ProfileMenu;
