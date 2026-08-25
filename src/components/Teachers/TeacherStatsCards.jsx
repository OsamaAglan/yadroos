// src/components/TeacherStatsCards.jsx
import React, { useEffect, useState } from "react";
import { Grid, Box, Typography, Skeleton, IconButton } from "@mui/material";
import { Users, BookOpen, ClipboardList, Settings } from "lucide-react";
import axiosInstance from "../../api/axiosInstance";
import { getUserFromToken } from "../../utils/auth";
import { Link } from "react-router-dom";

const TeacherStatsCards = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const user = getUserFromToken();
        const teacherId = user?.personId;
        const termId = 1;

        if (!teacherId || !termId) throw new Error("Token is missing required claims");

        const response = await axiosInstance.get(
          `/TeacherGroups/GetByTeacherID/${teacherId}`
        );

        setStats([
          { id: "groups", label: "📚 مجموعات", value: response.data.totalGroups, path: "/teacher-groups", },
          { id: "members", label: "👥 مشتركين", value: response.data.totalMembers, path: `/teacher-students/${teacherId}`, },
          { id: "approved", label: "✅ مفعل", value: response.data.totalApproved },
          { id: "pending", label: "⏳ منتظر", value: response.data.totalWaiting },
          { id: "suspended", label: "⛔ موقوف", value: response.data.totalSuspended },
        ]);
      } catch (err) {
        console.error("Failed to fetch stats", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <Grid container spacing={2} justifyContent="center">
      {(loading ? new Array(5).fill(null) : stats).map((stat, idx) => (
        <Grid item xs={6} sm={4} md={2} key={stat?.id || idx}>
          {loading ? (
            <Skeleton variant="text" width="80%" height={28} />
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" ,paddingBottom:"6px"}}>
              <IconButton>{stat.icon}</IconButton>
              {stat.path ? (
               
               <Typography
  component={Link}
  to={stat.path}
  sx={{
    textDecoration: "none",
    color: "#fff",   // لون ثابت أبيض
    fontWeight: "bold",
    "&:hover": { textDecoration: "underline" }, // تأثير Hover
  }}
>
  {stat.label}
</Typography>


              ) : (
                <Typography sx={{ fontWeight: "bold" }}>{stat.label}</Typography>
              )}
            </Box>
          )}
        </Grid>
      ))}
    </Grid>
  );
};

export default TeacherStatsCards;
