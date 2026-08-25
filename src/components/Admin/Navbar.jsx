import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Box,
  InputBase,
  Badge,
  Divider,
  Typography,
  ListItemText,
  Collapse,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Notifications,
  Search,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { getUserFromToken } from "../../utils/auth";
import axiosInstance from "../../api/axiosInstance";
import ProfileMenu from "../ProfileMenu";
import defaultAvatar from "../../assets/logo.png";
import ActionButton from "../../components/ActionButton";
import StatsCards from "../../components/Teachers/TeacherStatsCards";

const SearchBox = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius * 5,
  backgroundColor: "#fff",
  marginRight: theme.spacing(2),
  marginLeft: theme.spacing(2),
  width: "250px",
  display: "flex",
  alignItems: "center",
  padding: "2px 8px",
  boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
}));

const Navbar = ({ onToggleSidebar }) => {
  const user = getUserFromToken();
  const role = user?.role || "";
  const personId = user?.personId || 0;
  const userId = user?.userId;
  const [userData, setUserData] = useState(null);
  const [notifAnchor, setNotifAnchor] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    if (!personId || !role) return;

    const fetchUserData = async () => {
      try {
        let endpoint = "";
        switch (role) {
          case "مدرس":
            endpoint = `/teachers/GetByID/${personId}`;
            break;
          case "طالب":
            endpoint = `/students/GetByID/${personId}`;
            break;
          case "متابع":
            endpoint = `/parents/GetByID/${personId}`;
            break;
          case "مدير":
            endpoint = `/users/GetByID/${personId}`;
            break;
          default:
            return;
        }

        const res = await axiosInstance.get(endpoint);

        if (res.data.success && res.data.data.length > 0) {
          setUserData(res.data.data[0]);
        }
      } catch (err) {
        console.error("❌ خطأ في جلب بيانات المستخدم:", err);
      }
    };

    fetchUserData();
  }, [personId, role]);

  useEffect(() => {
    if (!userId) return;

    const fetchNotifications = async () => {
      try {
        const res = await axiosInstance.get(
          `/Notifications/GetByUserID/${userId}`
        );
        if (res.data.success) {
          setNotifications(res.data.data || []);
        }
      } catch (err) {
        console.error("❌ خطأ في تحميل الإشعارات:", err);
      }
    };

    fetchNotifications();
  }, [userId]);

  const handleMarkAsRead = async (id) => {
    try {
      await axiosInstance.put(
        `/Notifications/MarkAsRead?NotificationID=${id}`
      );
      setNotifications((prev) => prev.filter((n) => n.notificationId !== id));
    } catch (err) {
      console.error("❌ خطأ في تحديث الإشعار:", err);
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="fixed"
        sx={{
          background: "linear-gradient(to right, #1565c0, #1976d2, #1e88e5)",
          zIndex: (theme) => theme.zIndex.drawer - 1, // 👈 تعديل Z-Index لكي لا تغطي على الشاشة الجانبية (Sidebar)
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between", px: { xs: 1, sm: 2 } }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.5, sm: 1.5 } }}>
            <IconButton
              edge="start"
              color="inherit"
              onClick={onToggleSidebar}
              sx={{ mr: { xs: 0.5, sm: 1 } }}
            >
              <MenuIcon />
            </IconButton>
            <Box
              component="img"
              src={defaultAvatar}
              alt="Logo"
              sx={{
                width: { xs: "95px", sm: "130px" },
                height: "auto",
                maxHeight: 45,
                objectFit: "contain",
              }}
            />
          </Box>

          <Box
            sx={{
              flexGrow: 1,
              display: { xs: "none", md: "flex" },
              justifyContent: "center",
            }}
          >
            <SearchBox>
              <Search sx={{ color: "#1565c0", mr: 1 }} />
              <InputBase
                placeholder="ابحث هنا..."
                sx={{ color: "#000", flex: 1 }}
              />
            </SearchBox>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.5, sm: 1 } }}>
            <Box sx={{ display: { xs: "flex", md: "none" } }}>
              <IconButton
                color="inherit"
                onClick={() => setShowSearch(!showSearch)}
                size="small"
              >
                <Search />
              </IconButton>
            </Box>

            <IconButton
              color="inherit"
              onClick={(e) => setNotifAnchor(e.currentTarget)}
              size="small"
            >
              <Badge
                badgeContent={notifications.filter((n) => !n.isRead).length}
                color="error"
              >
                <Notifications />
              </Badge>
            </IconButton>
            <Menu
              anchorEl={notifAnchor}
              open={Boolean(notifAnchor)}
              onClose={() => setNotifAnchor(null)}
              PaperProps={{
                sx: { width: 320, maxHeight: 400 },
              }}
            >
              {notifications.length > 0 ? (
                <>
                  {notifications.slice(0, 5).map((n) => (
                    <MenuItem
                      key={n.notificationId}
                      sx={{
                        whiteSpace: "normal",
                        alignItems: "flex-start",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        gap: 1,
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: !n.isRead ? "bold" : "normal",
                            }}
                          >
                            {n.title}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary">
                            {n.message}
                          </Typography>
                        }
                      />
                      <ActionButton
                        label="اخفاء"
                        onClick={() => handleMarkAsRead(n.notificationId)}
                      />
                    </MenuItem>
                  ))}
                  <Divider />
                  <MenuItem
                    onClick={() => {
                      setNotifAnchor(null);
                      navigate("/notifications");
                    }}
                  >
                    <Typography color="primary">عرض الكل</Typography>
                  </MenuItem>
                </>
              ) : (
                <MenuItem disabled>لا توجد إشعارات</MenuItem>
              )}
            </Menu>

            <ProfileMenu userData={userData} role={role} />
          </Box>
        </Toolbar>

        {/* 👈 شريط البحث التفاعلي في شاشات الموبايل */}
        <Collapse in={showSearch} sx={{ display: { xs: "block", md: "none" } }}>
          <Box sx={{ p: 1, bgcolor: "rgba(0, 0, 0, 0.15)" }}>
            <SearchBox sx={{ width: "100%", m: 0 }}>
              <Search sx={{ color: "#1565c0", mr: 1 }} />
              <InputBase
                placeholder="ابحث هنا..."
                fullWidth
                sx={{ color: "#000", flex: 1 }}
              />
            </SearchBox>
          </Box>
        </Collapse>

        {/* 👈 إخفاء الإحصائيات في الهواتف الصغيرة حتى لا تغطي الشاشة */}
        {role === "مدرس" && (
          <Box
            sx={{
              display: { xs: "none", md: "flex" }, // تظهر فقط في الشاشات المتوسطة والكبيرة
              justifyContent: "center",
              bgcolor: "rgba(0, 0, 0, 0.12)",
              py: 0.5,
              px: 2,
            }}
          >
            <StatsCards />
          </Box>
        )}
      </AppBar>

      {/* المحافظة على المسافة التلقائية تحت AppBar */}
      <Toolbar />
      {role === "مدرس" && <Box sx={{ display: { xs: "none", md: "block" }, height: 35 }} />}
    </Box>
  );
};

export default Navbar;