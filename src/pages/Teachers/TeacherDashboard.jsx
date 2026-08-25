import React, { useEffect, useState, useCallback } from "react";
import { getUserFromToken } from "../../utils/auth";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import {
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import {
  CircularProgress,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Box,
} from "@mui/material";
import { BookOpen, Users, ClipboardList, Settings } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const user = getUserFromToken();
  const teacherId = user?.personId;

  const [growthData, setGrowthData] = useState([]);
  const [groupLines, setGroupLines] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ تحميل بيانات نمو المجموعات
  const loadGroupGrowth = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`Teachers/GetGroupGrowth/2`);
      const raw = res.data?.data ?? [];

      const dateSet = new Set();
      const groupMap = new Map();
      const lines = [];

      raw.forEach((group) => {
        lines.push(group.groupName);
        group.data.forEach((entry) => {
          const date = entry.joinDate;
          dateSet.add(date);
          if (!groupMap.has(group.groupName)) {
            groupMap.set(group.groupName, {});
          }
          groupMap.get(group.groupName)[date] = entry.studentsCount;
        });
      });

      setGroupLines(lines);

      const sortedDates = Array.from(dateSet).sort(
        (a, b) => new Date(a) - new Date(b)
      );

      const formatted = sortedDates.map((date) => {
        const entry = { date };
        groupMap.forEach((data, groupName) => {
          entry[groupName] = data[date] || 0;
        });
        return entry;
      });

      setGrowthData(formatted);
    } catch (err) {
      console.error("Error loading group growth:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ التأكد من هوية المستخدم
  useEffect(() => {
    const currentUser = getUserFromToken();
    if (!currentUser) return navigate("/login");

    if (currentUser.roles?.includes("مدرس") && currentUser.roles?.includes("طالب")) {
      navigate("/choose-role");
    } else if (currentUser.roles?.includes("مدرس")) {
      loadGroupGrowth();
    } else if (currentUser.roles?.includes("طالب")) {
      navigate("/student-dashboard");
    } else {
      navigate("/not-authorized");
    }
  }, [loadGroupGrowth, navigate]);

  // ✅ روابط سريعة
  const quickLinks = [
    {
      label: "إدارة المجموعات",
      icon: <Users size={20} />,
      path: "/teacher-groups",
    },
    {
      label: "متابعة الواجبات",
      icon: <ClipboardList size={20} />,
      path: "/teacher/assignments",
    },
    {
      label: "بنك الأسئلة",
      icon: <BookOpen size={20} />,
      path: "/teacher/questions-bank",
    },
    {
      label: "الإعدادات",
      icon: <Settings size={20} />,
      path: "/teacher-settings",
    },
  ];

  return (
    <div className="p-3 sm:p-5 md:p-6 space-y-4 sm:space-y-6 bg-blue-900 min-h-screen text-white rounded-2xl">
      {/* ✅ اللوجو والعنوان */}
      <div className="flex items-center gap-3">
        <BookOpen size={30} className="text-yellow-400 shrink-0" />
        <h1 className="text-xl sm:text-2xl font-bold text-yellow-400">
          لوحة تحكم المعلم
        </h1>
      </div>

      {/* ✅ روابط سريعة */}
      <Card sx={{ bgcolor: "#1e40af", color: "#fff", borderRadius: 3 }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography
            variant="h6"
            sx={{
              mb: 2.5,
              color: "#facc15",
              fontSize: { xs: "1.1rem", sm: "1.25rem" },
              fontWeight: "bold",
            }}
          >
            🚀 روابط سريعة
          </Typography>
          <Grid container spacing={{ xs: 1.5, sm: 2 }}>
            {quickLinks.map((link, idx) => (
              <Grid item xs={12} sm={6} md={3} key={idx}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => navigate(link.path)}
                  startIcon={link.icon}
                  sx={{
                    backgroundColor: "#1e3a8a",
                    color: "#facc15",
                    fontWeight: "bold",
                    borderRadius: "12px",
                    py: 1.5,
                    fontSize: { xs: "0.95rem", sm: "1rem" },
                    "&:hover": { backgroundColor: "#2563eb" },
                  }}
                >
                  {link.label}
                </Button>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* ✅ الرسم البياني لنمو الطلاب */}
      <Card sx={{ bgcolor: "#1e40af", color: "#fff", borderRadius: 3 }}>
        <CardContent sx={{ p: { xs: 1.5, sm: 3 } }}>
          <Typography
            variant="h6"
            sx={{
              mb: 2.5,
              color: "#facc15",
              fontSize: { xs: "1.1rem", sm: "1.25rem" },
              fontWeight: "bold",
            }}
          >
            📊 تطور عدد الطلاب في المجموعات
          </Typography>

          {loading ? (
            <div className="flex justify-center p-8">
              <CircularProgress color="inherit" />
            </div>
          ) : growthData.length > 0 ? (
            <Box sx={{ width: "100%", height: { xs: 280, sm: 350 }, overflowX: "auto" }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={growthData}
                  margin={{ top: 5, right: 15, left: 0, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#3b82f6" />
                  <XAxis dataKey="date" angle={-30} textAnchor="end" stroke="#cbd5e1" />
                  <YAxis stroke="#cbd5e1" />
                  <Tooltip contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155" }} />
                  <Legend />
                  {groupLines.map((group, index) => (
                    <Line
                      key={group}
                      type="monotone"
                      dataKey={group}
                      stroke={[
                        "#60a5fa",
                        "#f97316",
                        "#4ade80",
                        "#f43f5e",
                        "#a855f7",
                      ][index % 5]}
                      strokeWidth={2.5}
                      name={group}
                      dot={{ r: 3 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </Box>
          ) : (
            <Typography className="text-center py-6 text-slate-300">
              لا توجد بيانات نمو متاحة حالياً
            </Typography>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
