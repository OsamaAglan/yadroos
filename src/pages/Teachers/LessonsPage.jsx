import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  CircularProgress,
  Switch,
  FormControlLabel,
  Divider,
  Grid,
  Paper,
  RadioGroup,
  Radio,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from "@mui/material";

import axiosInstance from "../../api/axiosInstance";
import { getEmbedUrl } from "../../utils/mediaUtils";

const CONTENT_TYPES = {
  VIDEO: 1,
  FILE: 2,
  QUIZ: 3,
};

export default function LessonsPage({
  lessonId = 0,
  teacherGroupID,
  onSaved,
}) {
  const [loading, setLoading] = useState(false);

  // 🔹 حالة تخزين قائمة الاختبارات الخاصة بالجروب
  const [quizzes, setQuizzes] = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);

  /*************************************************
   * بيانات الدرس
   *************************************************/
  const [lessonData, setLessonData] = useState({
    lessonId: 0,
    teacherGroupID: teacherGroupID || 0,
    title: "",
    description: "",
    lessonOrder: 1,
    isFree: true,
    contentTypeID: CONTENT_TYPES.VIDEO,
    contentURL: "",
  });

  const updateField = (key, value) => {
    setLessonData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  /*************************************************
   * 🛡️ جلب قائمة الاختبارات المتاحة للجروب
   *************************************************/
  const fetchQuizzesByGroupId = async (groupId) => {
    if (!groupId) return;
    setLoadingQuizzes(true);
    try {
      const res = await axiosInstance.get(`/Quizzes/GetByGroupID/${groupId}`);
      if (res.data?.success && Array.isArray(res.data.data)) {
        setQuizzes(res.data.data);
      } else {
        setQuizzes([]);
      }
    } catch (error) {
      console.error("خطأ أثناء جلب الاختبارات:", error);
      setQuizzes([]);
    } finally {
      setLoadingQuizzes(false);
    }
  };

  // جلب الاختبارات عند اختيار نوع المحتوى اختبار أو عند تحميل الجروب
  useEffect(() => {
    const activeGroupId = teacherGroupID || lessonData.teacherGroupID;
    if (
      lessonData.contentTypeID === CONTENT_TYPES.QUIZ &&
      activeGroupId
    ) {
      fetchQuizzesByGroupId(activeGroupId);
    }
  }, [lessonData.contentTypeID, teacherGroupID, lessonData.teacherGroupID]);

  /*************************************************
   * 🛡️ دالة معالجة وتهيئة الروابط قبل الحفظ
   *************************************************/
  const prepareContentUrlBeforeSave = (url) => {
    if (!url) return "";
    return getEmbedUrl(url);
  };

  /*************************************************
   * تحميل بيانات الدرس من السيرفر وفلترتها
   *************************************************/
  const fetchLessonById = async () => {
    if (!lessonId) return;

    setLoading(true);
    try {
      const res = await axiosInstance.get(`/Lessons/GetByID/${lessonId}`);

      if (res.data.success && Array.isArray(res.data.data)) {
        const currentLesson = res.data.data.find(
          (item) => Number(item.lessonId) === Number(lessonId)
        );

        if (currentLesson) {
          const currentGroupId = currentLesson.teacherGroupId || teacherGroupID || 0;
          const currentContentType = currentLesson.contentTypeId || CONTENT_TYPES.VIDEO;

          setLessonData({
            lessonId: currentLesson.lessonId,
            teacherGroupID: currentGroupId,
            title: currentLesson.title || "",
            description: currentLesson.description || "",
            lessonOrder: currentLesson.lessonOrder ?? 1,
            isFree: currentLesson.isFree ?? true,
            contentTypeID: currentContentType,
            contentURL: currentLesson.contentUrl || "",
          });

          // إذا كان المحتوى اختبار، نقوم بجلب قائمته مباشرة
          if (currentContentType === CONTENT_TYPES.QUIZ && currentGroupId) {
            fetchQuizzesByGroupId(currentGroupId);
          }
        } else {
          console.warn(`الدرس ذو الرقم ${lessonId} غير موجود في القائمة المستلمة`);
        }
      }
    } catch (e) {
      console.error("خطأ أثناء جلب بيانات الدرس:", e);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (lessonId && lessonId !== 0) {
      fetchLessonById();
    } else {
      setLessonData({
        lessonId: 0,
        teacherGroupID: teacherGroupID || 0,
        title: "",
        description: "",
        lessonOrder: 1,
        isFree: true,
        contentTypeID: CONTENT_TYPES.VIDEO,
        contentURL: "",
      });
    }
  }, [lessonId, teacherGroupID]);

  /*************************************************
   * تغيير نوع المحتوى
   *************************************************/
  const handleContentTypeChange = (value) => {
    const selectedType = Number(value);
    setLessonData((prev) => ({
      ...prev,
      contentTypeID: selectedType,
      contentURL: "",
    }));
  };

  /*************************************************
   * حفظ الدرس
   *************************************************/
  const handleSaveLesson = async () => {
    if (!lessonData.title.trim()) {
      alert("برجاء إدخال عنوان الدرس");
      return;
    }

    if (!String(lessonData.contentURL).trim()) {
      alert(
        lessonData.contentTypeID === CONTENT_TYPES.VIDEO
          ? "برجاء إدخال رابط الفيديو"
          : lessonData.contentTypeID === CONTENT_TYPES.QUIZ
          ? "برجاء اختيار اختبار من القائمة"
          : "برجاء إدخال رابط الملف"
      );
      return;
    }

    setLoading(true);

    try {
      const optimizedUrl =
        lessonData.contentTypeID === CONTENT_TYPES.QUIZ
          ? String(lessonData.contentURL)
          : prepareContentUrlBeforeSave(lessonData.contentURL);

      const payload = {
        lessonId: lessonData.lessonId || lessonId || 0,
        teacherGroupID: Number(teacherGroupID || lessonData.teacherGroupID),
        title: lessonData.title,
        isFree: lessonData.isFree,
        lessonOrder: Number(lessonData.lessonOrder),
        description: lessonData.description,
        contentTypeID: Number(lessonData.contentTypeID),
        contentURL: optimizedUrl,
      };

      const isNew = !lessonData.lessonId;
      const url = isNew ? "/Lessons/Insert" : "/Lessons/Update";
      const method = isNew ? "post" : "put";

      const res = await axiosInstance[method](url, payload, {
        headers: {
          "Content-Type": "application/json-patch+json",
        },
      });

      if (res.data.success) {
        alert(isNew ? "تم إضافة الدرس بنجاح" : "تم تحديث الدرس بنجاح");
        onSaved?.();
      } else {
        alert("فشل الحفظ");
      }
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء الحفظ");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: 250,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 4, borderRadius: 3, maxWidth: 800, mx: "auto" }}>
      <Grid container spacing={4}>
        {/* بيانات الدرس الرئيسية */}
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="عنوان الدرس"
                  value={lessonData.title}
                  onChange={(e) => updateField("title", e.target.value)}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="وصف الدرس"
                  value={lessonData.description}
                  onChange={(e) => updateField("description", e.target.value)}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="ترتيب الدرس"
                  value={lessonData.lessonOrder}
                  onChange={(e) => updateField("lessonOrder", Number(e.target.value))}
                />
              </Grid>

              <Grid item xs={12} md={8} sx={{ display: "flex", alignItems: "center" }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={lessonData.isFree}
                      onChange={(e) => updateField("isFree", e.target.checked)}
                    />
                  }
                  label="الدرس مجاني"
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* محتوى الدرس (نوع المحتوى والرابط / الاختبار) */}
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
            <FormControl fullWidth>
              <RadioGroup
                row
                value={lessonData.contentTypeID}
                onChange={(e) => handleContentTypeChange(e.target.value)}
              >
                <FormControlLabel value={CONTENT_TYPES.VIDEO} control={<Radio />} label="فيديو" />
                <FormControlLabel value={CONTENT_TYPES.FILE} control={<Radio />} label="ملف / صورة" />
                <FormControlLabel value={CONTENT_TYPES.QUIZ} control={<Radio />} label="اختبار" />
              </RadioGroup>
            </FormControl>

            <Divider sx={{ my: 2 }} />

            {/* 🔹 التبديل بين حقل النص والـ Select بناءً على نوع المحتوى */}
            {lessonData.contentTypeID === CONTENT_TYPES.QUIZ ? (
              <FormControl fullWidth size="medium">
                <InputLabel id="select-quiz-label">اختر الاختبار</InputLabel>
                <Select
                  labelId="select-quiz-label"
                  label="اختر الاختبار"
                  value={lessonData.contentURL}
                  onChange={(e) => updateField("contentURL", e.target.value)}
                  disabled={loadingQuizzes}
                >
                  {loadingQuizzes ? (
                    <MenuItem disabled value="">
                      <CircularProgress size={20} sx={{ mr: 1 }} /> جاري تحميل الاختبارات...
                    </MenuItem>
                  ) : quizzes.length > 0 ? (
                    quizzes.map((q) => (
                      <MenuItem key={q.quizId} value={String(q.quizId)}>
                        {q.quizName}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled value="">
                      لا توجد اختبارات متاحة لتقسيم هذه المجموعة
                    </MenuItem>
                  )}
                </Select>
                <FormHelperText>سيتم حفظ معرف الاختبار (Quiz ID) في محتوى الدرس</FormHelperText>
              </FormControl>
            ) : (
              <TextField
                fullWidth
                label={
                  lessonData.contentTypeID === CONTENT_TYPES.VIDEO
                    ? "رابط الفيديو"
                    : "رابط الملف / الصورة"
                }
                placeholder="https://..."
                value={lessonData.contentURL}
                onChange={(e) => updateField("contentURL", e.target.value)}
              />
            )}
          </Paper>
        </Grid>

        {/* أزرار الحفظ الإغلاق */}
        <Grid item xs={12}>
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              borderRadius: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography color="text.secondary">
              تأكد من مراجعة بيانات الدرس قبل الحفظ.
            </Typography>

            <Button
              variant="contained"
              size="large"
              onClick={handleSaveLesson}
              disabled={loading}
              sx={{ px: 6, py: 1.5, fontWeight: "bold" }}
            >
              حفظ الدرس
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Paper>
  );
}