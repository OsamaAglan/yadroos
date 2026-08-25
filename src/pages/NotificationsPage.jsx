import React, { useEffect, useState } from "react";
import {
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  CircularProgress,
  Box,
  Divider,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import axiosInstance from "../api/axiosInstance";
import { getUserFromToken } from "../utils/auth";
import { useNavigate } from "react-router-dom";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = getUserFromToken();
  const userId = user?.userId;
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) return;

    const fetchNotifications = async () => {
      try {
        const res = await axiosInstance.get(`/Notifications/GetByUserID/${userId}`);
        if (res.data.success) {
          setNotifications(res.data.data);
        }
      } catch (err) {
        console.error("❌ خطأ في جلب الإشعارات:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [userId]);

  const handleMarkAsRead = async (id, linkUrl) => {
    try {
      await axiosInstance.put(`/Notifications/MarkAsRead?NotificationID=${id}`);
      setNotifications((prev) =>
        prev.map((n) =>
          n.notificationId === id ? { ...n, isRead: true } : n
        )
      );

      if (linkUrl && linkUrl !== "string") {
        navigate(linkUrl);
      }
    } catch (err) {
      console.error("❌ خطأ في تحديث حالة الإشعار:", err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        الإشعارات
      </Typography>
      <List>
        {notifications.map((n, index) => (
          <React.Fragment key={n.notificationId}>
            <ListItem
              button
              onClick={() => handleMarkAsRead(n.notificationId, n.linkUrl)}
              sx={{
                bgcolor: n.isRead ? "transparent" : "rgba(25, 118, 210, 0.1)",
                borderRadius: 2,
                mb: 1,
              }}
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: "#1976d2" }}>
                  <NotificationsIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={n.title}
                secondary={
                  <>
                    <Typography variant="body2" color="text.secondary">
                      {n.message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(n.createdAt).toLocaleString("ar-EG")}
                    </Typography>
                  </>
                }
              />
            </ListItem>
            {index < notifications.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};

export default NotificationsPage;
