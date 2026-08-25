import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Paper,
  Grid,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Stack,
  Divider,
} from "@mui/material";

import { useSearchParams } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";

import AddIcon from "@mui/icons-material/Add";
import QuizIcon from "@mui/icons-material/Quiz"; // 👈 أيقونة الأسئلة

import LessonCard from "../../components/Teachers/Teachers_LessonCard";
import LessonsPage from "./LessonsPage";
import ExercisesTab from "./ExercisesTab"; // 👈 استيراد صفحة الأسئلة هنا

export default function GroupDetails2() {
  const [searchParams] = useSearchParams();
  const groupId = searchParams.get("groupId");

  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);

  const [openDialog, setOpenDialog] = useState(false);
  const [openExercisesDialog, setOpenExercisesDialog] = useState(false); // 👈 حالة بوب آب الأسئلة
  const [selectedLessonId, setSelectedLessonId] = useState(0);

  // 1. جلب دروس المنصة الأساسية من قاعدة البيانات
  const fetchLessons = async () => {
    if (!groupId) return [];
    try {
      const res = await axiosInstance.get(`/Lessons/GetByGroupID/${groupId}`);
      if (res?.data?.success && Array.isArray(res.data.data)) {
        return res.data.data.map((lesson) => ({ ...lesson, isYoutube: false }));
      }
    } catch (err) {
      console.error("خطأ في جلب دروس المنصة:", err);
    }
    return [];
  };

  const fetchAllContents = useCallback(async () => {
    setLoading(true);
    try {
      const platformLessons = await fetchLessons();
      setLessons(platformLessons);
    } catch (error) {
      console.error("حدث خطأ غير متوقع أثناء تجميع المحتوى:", error);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetchAllContents();
  }, [fetchAllContents]);

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm("هل تريد حذف الدرس؟")) return;

    try {
      const res = await axiosInstance.delete(`/Lessons/Delete/${lessonId}`);
      if (res?.data?.success) {
        alert("تم الحذف بنجاح");
        fetchAllContents();
      }
    } catch {
      alert("حدث خطأ أثناء الحذف");
    }
  };

  const openLessonDialog = (lessonId = 0) => {
    setSelectedLessonId(lessonId);
    setOpenDialog(true);
  };

  const handleUploadLessonImage = async (file, lesson) => {
    if (!file || !lesson) return "";

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("groupId", groupId);
      formData.append("lessonId", lesson.lessonId);
      formData.append("uploadType", "LessonProfile");
      formData.append("isPublic", true);
      formData.append("teacherId", 1);

      const res = await axiosInstance.post("/Uploads/Insert", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res?.data?.success) {
        const imagePath = res.data.data;

        setLessons((prev) =>
          prev.map((item) =>
            item.lessonId === lesson.lessonId
              ? { ...item, lessonImagePath: imagePath }
              : item
          )
        );

        return imagePath;
      }

      return lesson.lessonImagePath || "";
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء رفع الصورة");
      return lesson.lessonImagePath || "";
    }
  };

  /*************************************************
   * 🛠️ منطق الترتيب والتجميع للفواصل
   *************************************************/
  const sortedLessons = [...lessons].sort((a, b) => (a.lessonOrder || 0) - (b.lessonOrder || 0));

  const groupedLessons = sortedLessons.reduce((groups, lesson) => {
    const order = lesson.lessonOrder || 1;
    if (!groups[order]) {
      groups[order] = [];
    }
    groups[order].push(lesson);
    return groups;
  }, {});

  return (
    <Box sx={{ p: 2 }}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography variant="h6">📚 محتويات المجموعة</Typography>
          <box > </box>
          <Stack direction="row" spacing={1.5} sx={{ ml: "auto" }}>
            {/* ➕ زر فتح صفحة الأسئلة الجديد */}
            <Button
              variant="outlined"
              
              color="info"
              startIcon={<QuizIcon />}
              onClick={() => setOpenExercisesDialog(true)}
              sx={{
    fontWeight: "bold",
    "& .MuiButton-startIcon": {
      marginInlineEnd: "10px", // المسافة بين الأيقونة والنص
      marginInlineStart: 0,
    },
  }}
            >
              
               التقييمات والاختبارات
            </Button>
   <box > </box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => openLessonDialog(0)}
              sx={{
    fontWeight: "bold",
    "& .MuiButton-startIcon": {
      marginInlineEnd: "10px", // المسافة بين الأيقونة والنص
      marginInlineStart: 0,
    },
  }}
            >
              إضافة درس
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {loading ? (
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        Object.keys(groupedLessons).map((order) => (
          <Box key={order} sx={{ mb: 4 }}>
            <Divider 
              textAlign="center"
              sx={{ 
                my: 3, 
                "&::before, &::after": { borderColor: "primary.light" } 
              }}
            >
              <Typography variant="subtitle1" sx={{ color: "primary.main", fontWeight: "bold", px: 2}}>
                {order}
              </Typography>
            </Divider>

            <Grid container spacing={2}>
              {groupedLessons[order].map((lesson) => (
                <Grid key={lesson.lessonId} item xs={12} sm={6} md={4} lg={3}>
                  <LessonCard
                    lesson={lesson}
                    onEdit={openLessonDialog}
                    onDelete={handleDeleteLesson}
                    onUploadImage={handleUploadLessonImage}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        ))
      )}

      {/* ─── بوب آب إضافة وتعديل الدرس ─── */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="md">
        <DialogTitle>{selectedLessonId === 0 ? "إضافة درس" : "تعديل درس"}</DialogTitle>
        <DialogContent dividers>
          <LessonsPage
            key={selectedLessonId}
            lessonId={selectedLessonId}
            teacherGroupID={groupId}
            onSaved={() => {
              setOpenDialog(false);
              fetchAllContents();
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>إغلاق</Button>
        </DialogActions>
      </Dialog>

      {/* ─── 🔥 بوب آب بنك الأسئلة المضاف حديثاً ─── */}
      <Dialog 
        open={openExercisesDialog} 
        onClose={() => setOpenExercisesDialog(false)} 
        fullWidth 
        maxWidth="xl" // تم جعلها كبيرة جداً لتناسب عرض الجداول والبطاقات
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ bgcolor: "grey.50", fontWeight: "bold" }}>❓ إدارة التقييمات   </DialogTitle>
        <DialogContent dividers sx={{ p: 0, bgcolor: "#f5f6fa" }}>
          {/* استدعاء صفحة الأسئلة وتمرير الـ props المطلوبة لها */}
          <ExercisesTab />
        </DialogContent>
        <DialogActions sx={{ bgcolor: "grey.50", p: 2 }}>
          <Button onClick={() => setOpenExercisesDialog(false)} variant="contained" color="inherit">
            إغلاق نافذة الأسئلة
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}