import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Paper,
  Grid,
  Typography,
  CircularProgress,
  Stack,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";

import { useSearchParams } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";

// ✅ استيراد بطاقة الطالب المخصصة للعرض والاشتراك
import StudentLessonCard from "../../components/Students/StudentLessonCard";
import StudentExercisesTab from "../../components/Students/StudentExercisesTab";

export default function StudentGroupDetails() {
  const [searchParams] = useSearchParams();
  const groupId = searchParams.get("groupId");

  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);

  // حالات التحكم في بوب آب الاختبارات المباشرة أو التقييمات
  const [openExercisesDialog, setOpenExercisesDialog] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState(0);

  // جلب دروس المجموعة الخاصة بالطالب
  const fetchLessons = async () => {
    if (!groupId) return [];
    try {
      const res = await axiosInstance.get(`/Lessons/GetByGroupID/${groupId}`);
      if (res?.data?.success && Array.isArray(res.data.data)) {
        return res.data.data.map((lesson) => ({ ...lesson, isYoutube: false }));
      }
    } catch (err) {
      console.error("خطأ في جلب دروس المنصة للطالب:", err);
    }
    return [];
  };

  const fetchAllContents = useCallback(async () => {
    setLoading(true);
    try {
      const platformLessons = await fetchLessons();
      setLessons(platformLessons);
    } catch (error) {
      console.error("حدث خطأ غير متوقع أثناء تحميل الدروس:", error);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetchAllContents();
  }, [fetchAllContents]);

  // فتح اختبار محدد عند الضغط عليه من البطاقة
  const handleOpenQuiz = (quizId) => {
    setSelectedQuizId(Number(quizId) || 0);
    setOpenExercisesDialog(true);
  };

  // التعامل مع طلب الاشتراك للدروس غير المجانية
  const handleRequestSubscribe = async (lesson) => {
    try {
      // إرسال طلب اشتراك للمدرس (يمكن تعديل المسار والبيانات حسب API الخادم)
      const res = await axiosInstance.post("/Subscriptions/RequestAccess", {
        groupId: groupId,
        lessonId: lesson.lessonId,
      });

      if (res?.data?.success) {
        alert("تم إرسال طلب الاشتراك بنجاح! بانتظار موافقة المعلم.");
        fetchAllContents(); // إعادة التحميل لتحديث حالة الزر إلى "قيد الموافقة"
      } else {
        alert(res?.data?.message || "تم إرسال الطلب مسبقاً أو حدث خطأ.");
      }
    } catch (err) {
      console.error("خطأ في إرسال طلب الاشتراك:", err);
      alert("حدث خطأ أثناء إرسال طلب الاشتراك.");
    }
  };

  /*************************************************
   * 🛠️ ترتيب وتجميع الدروس حسب رقم الترتيب
   *************************************************/
  const sortedLessons = [...lessons].sort(
    (a, b) => (a.lessonOrder || 0) - (b.lessonOrder || 0)
  );

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
      {/* هيدر الصفحة */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 3, boxShadow: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" fontWeight="bold" color="primary">
            📚 دروس ومحتويات المجموعة
          </Typography>
        </Stack>
      </Paper>

      {/* عرض الدروس مقسمة حسب الترتيب */}
      {loading ? (
        <Box sx={{ textAlign: "center", mt: 6 }}>
          <CircularProgress />
        </Box>
      ) : Object.keys(groupedLessons).length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center", borderRadius: 3 }}>
          <Typography color="text.secondary">
            لا توجد دروس مضافة في هذه المجموعة حالياً.
          </Typography>
        </Paper>
      ) : (
        Object.keys(groupedLessons).map((order) => (
          <Box key={order} sx={{ mb: 4 }}>
            <Divider
              textAlign="center"
              sx={{
                my: 3,
                "&::before, &::after": { borderColor: "primary.light" },
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{
                  color: "primary.main",
                  fontWeight: "bold",
                  px: 2,
                  bgcolor: "background.paper",
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "primary.light",
                }}
              >
                القسم / الترتيب: {order}
              </Typography>
            </Divider>

            <Grid container spacing={2}>
              {groupedLessons[order].map((lesson) => (
                <Grid key={lesson.lessonId} item xs={12} sm={6} md={4} lg={3}>
                  {/* ✅ استخدام مكون بطاقة الطالب المخصصة */}
                  <StudentLessonCard
                    lesson={lesson}
                    onOpenQuiz={handleOpenQuiz}
                    onRequestSubscribe={handleRequestSubscribe}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        ))
      )}

      {/* ─── 📝 بوب آب التقييمات والاختبارات الخاصة بالطالب ─── */}
      <Dialog
        open={openExercisesDialog}
        onClose={() => setOpenExercisesDialog(false)}
        fullWidth
        maxWidth="lg"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ bgcolor: "grey.50", fontWeight: "bold" }}>
          📝 التقييمات والاختبارات
        </DialogTitle>
        <DialogContent dividers sx={{ p: 2, bgcolor: "#f5f6fa" }}>
          <StudentExercisesTab
            groupId={groupId}
            quizId={selectedQuizId}
          />
        </DialogContent>
        <DialogActions sx={{ bgcolor: "grey.50", p: 1.5 }}>
          <Button
            onClick={() => setOpenExercisesDialog(false)}
            variant="contained"
            color="primary"
          >
            إغلاق
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}