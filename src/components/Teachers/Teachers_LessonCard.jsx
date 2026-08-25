import React, { useRef, useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Box,
  Chip,
  Stack,
  Divider,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Alert,
  Paper,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import PlayCircleFilledWhiteIcon from "@mui/icons-material/PlayCircleFilledWhite";
import VisibilityIcon from "@mui/icons-material/Visibility";
import QuizIcon from "@mui/icons-material/Quiz";
import CloseIcon from "@mui/icons-material/Close";
import TagIcon from "@mui/icons-material/Tag";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";

import axiosInstance from "../../api/axiosInstance";
import { getEmbedUrl } from "../../utils/mediaUtils";

const DEFAULT_BG =
  "https://yadroosdev.com-eg.net//uploads/teachers/1006/profile/be661c32-3959-47ea-bc37-9aecf83b63cd_IMG_1088.png";

export default function LessonCard({
  lesson,
  onEdit,
  onDelete,
  onUploadImage,
}) {
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [openPreview, setOpenPreview] = useState(false);
  const [currentImage, setCurrentImage] = useState(
    lesson.lessonImagePath || DEFAULT_BG
  );

  // 🔹 حالة تخزين بيانات الاختبار عند الجلب
  const [quizDetails, setQuizDetails] = useState(null);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [quizError, setQuizError] = useState("");

  // 🛡️ استخراج الرابط بناءً على الاستجابة الجديدة للـ API (videoUrl, docUrl, contentUrl)
  const lessonUrl = (
    lesson.videoUrl ||
    lesson.docUrl ||
    lesson.contentUrl ||
    lesson.contentURL ||
    ""
  ).trim();

  // 🛡️ تحديد رقم الاختبار
  const resolvedQuizId = lesson.quizId || lessonUrl;

  // 🛡️ التحقق مما إذا كان الدرس اختباراً
  const typeNameLower = (lesson.typeName || "").toLowerCase();
  const isQuiz =
    Number(lesson.contentTypeId) === 3 ||
    Number(lesson.contentTypeID) === 3 ||
    Number(lesson.quizId) > 0 ||
    typeNameLower.includes("quiz") ||
    typeNameLower.includes("test") ||
    typeNameLower.includes("exam") ||
    typeNameLower.includes("اختبار");

  useEffect(() => {
    setCurrentImage(lesson.lessonImagePath || DEFAULT_BG);
  }, [lesson.lessonImagePath]);

  // 🔹 دالة جلب بيانات الاختبار برقم الـ Quiz
  const fetchQuizData = async (quizId) => {
    if (!quizId || Number(quizId) === 0) {
      setQuizError("رقم الاختبار غير متوفر في بيانات الدرس");
      return;
    }

    setLoadingQuiz(true);
    setQuizError("");
    setQuizDetails(null);

    try {
      const res = await axiosInstance.get(`/Quizzes/GetByID/${quizId}`);
      if (res.data?.success && res.data?.data) {
        setQuizDetails(res.data.data);
      } else {
        setQuizError(res.data?.message || "فشل جلب بيانات الاختبار");
      }
    } catch (err) {
      console.error("خطأ أثناء جلب الاختبار:", err);
      setQuizError("حدث خطأ أثناء تحميل بيانات الاختبار");
    } finally {
      setLoadingQuiz(false);
    }
  };

  // 🔹 فتح النافذة وجلب بيانات الاختبار إذا كان الدرس من نوع اختبار
  const handleOpenPreview = () => {
    setOpenPreview(true);
    if (isQuiz) {
      fetchQuizData(resolvedQuizId);
    }
  };

  const handleImageClick = (e) => {
    if (
      e.target.closest(".card-actions-container") ||
      e.target.closest(".view-content-btn")
    )
      return;
    if (lesson.isYoutube) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const uploadedPath = await onUploadImage(file, lesson);
      if (uploadedPath) {
        setCurrentImage(uploadedPath);
      }
    } catch (err) {
      console.error("فشل رفع الصورة:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 إعدادات زر العرض بناءً على نوع الدرس
  const renderViewButtonProps = () => {
    if (isQuiz) {
      return { text: "عرض الاختبار", icon: <QuizIcon />, color: "success" };
    }
    const type = (lesson.typeName || "").toLowerCase();
    const isVideo =
      type === "video" ||
      Boolean(lesson.videoUrl) ||
      lesson.isYoutube ||
      Number(lesson.contentTypeId) === 1;

    if (isVideo) {
      return { text: "تشغيل الفيديو", icon: <PlayCircleFilledWhiteIcon />, color: "error" };
    } else {
      return { text: "تصفح الملف", icon: <VisibilityIcon />, color: "primary" };
    }
  };

  const btnProps = renderViewButtonProps();
  const type = (lesson.typeName || "").toLowerCase();
  const isVideoContent =
    type === "video" ||
    Boolean(lesson.videoUrl) ||
    lesson.isYoutube ||
    Number(lesson.contentTypeId) === 1;

  return (
    <>
      <Card
        sx={{
          height: 380,
          display: "flex",
          flexDirection: "column",
          borderRadius: 4,
          overflow: "hidden",
          border: "1px solid",
          borderColor: "grey.100",
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            transform: "translateY(-6px)",
            boxShadow: "0px 12px 30px rgba(0, 0, 0, 0.12)",
            "& .lesson-card-image": { transform: "scale(1.06)" },
            "& .upload-overlay-btn": { opacity: 1 },
            "& .center-play-overlay": { opacity: 1 },
          },
        }}
      >
        {/* ─── الجزء العلوي: الصورة والتحكم بها ─── */}
        <Box
          onClick={handleImageClick}
          sx={{
            height: 180,
            position: "relative",
            overflow: "hidden",
            cursor: lesson.isYoutube ? "default" : "pointer",
            bgcolor: "grey.900",
          }}
        >
          <Box
            className="lesson-card-image"
            sx={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url("${encodeURI(currentImage)}")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              transition: "transform 0.5s ease",
            }}
          />

          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0) 50%)",
            }}
          />

          <Stack
            direction="row"
            spacing={1}
            sx={{ position: "absolute", top: 12, right: 12, zIndex: 2 }}
          >
            <Chip
              label={lesson.isFree ? "مجاني" : "مدفوع"}
              size="small"
              variant="contained"
              color={lesson.isFree ? "success" : "warning"}
              sx={{ fontWeight: "bold", backdropFilter: "blur(4px)", boxShadow: 1 }}
            />
            {lesson.isYoutube && (
              <Chip
                label="يوتيوب"
                color="error"
                size="small"
                sx={{ fontWeight: "bold", boxShadow: 1 }}
              />
            )}
          </Stack>

          {!lesson.isYoutube && (
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              style={{ display: "none" }}
            />
          )}

          {!lesson.isYoutube && (
            <IconButton
              className="upload-overlay-btn"
              size="small"
              sx={{
                position: "absolute",
                top: 12,
                left: 12,
                zIndex: 3,
                opacity: loading ? 1 : 0,
                transition: "opacity 0.2s",
                bgcolor: "rgba(0, 0, 0, 0.6)",
                color: "#fff",
                "&:hover": { bgcolor: "rgba(0, 0, 0, 0.8)" },
              }}
            >
              {loading ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <PhotoCamera fontSize="small" />
              )}
            </IconButton>
          )}

          <Box
            className="center-play-overlay"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenPreview();
            }}
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "rgba(0, 0, 0, 0.35)",
              opacity: 0,
              transition: "opacity 0.3s ease",
              cursor: "pointer",
              zIndex: 2,
            }}
          >
            <Button
              className="view-content-btn"
              variant="contained"
              color={btnProps.color}
              startIcon={btnProps.icon}
              size="small"
              sx={{ borderRadius: 2, fontWeight: "bold", px: 2, boxShadow: 3 }}
            >
              {btnProps.text}
            </Button>
          </Box>
        </Box>

        {/* ─── الجزء السفلي: البيانات والنصوص ─── */}
        <CardContent
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            p: 2,
            bgcolor: "#ffffff",
          }}
        >
          <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
            <Chip
              icon={
                <TagIcon style={{ fontSize: 14, marginRight: -4, marginLeft: 2 }} />
              }
              label={`الترتيب: ${lesson.lessonOrder || 1}`}
              size="small"
              sx={{
                bgcolor: "grey.50",
                color: "grey.700",
                fontWeight: "bold",
                fontSize: 11,
              }}
            />
            <Chip
              label={isQuiz ? "اختبار" : lesson.typeName || "درس"}
              size="small"
              variant="outlined"
              color={isQuiz ? "success" : "default"}
              sx={{ fontSize: 11, height: 20 }}
            />
          </Stack>

          <Typography
            variant="subtitle1"
            fontWeight="700"
            color="text.primary"
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              lineHeight: 1.4,
              mb: 0.5,
            }}
          >
            {lesson.title}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              fontSize: 12,
              lineHeight: 1.5,
              mb: "auto",
            }}
          >
            {lesson.description || "لا يوجد وصف مضاف لهذا الدرس حالياً."}
          </Typography>

          <Divider sx={{ my: 1.5, borderColor: "grey.100" }} />

          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            className="card-actions-container"
          >
            <Stack direction="row" spacing={1}>
              <Tooltip title="تعديل بيانات الدرس">
                <IconButton
                  size="small"
                  sx={{
                    color: "primary.main",
                    bgcolor: "primary.50",
                    "&:hover": { bgcolor: "primary.100" },
                    borderRadius: 2,
                    p: 0.8,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(lesson.lessonId);
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              {onDelete && !lesson.isYoutube && (
                <Tooltip title="حذف الدرس">
                  <IconButton
                    size="small"
                    sx={{
                      color: "error.main",
                      bgcolor: "error.50",
                      "&:hover": { bgcolor: "error.100" },
                      borderRadius: 2,
                      p: 0.8,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(lesson.lessonId);
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>

            <Button
              className="view-content-btn"
              variant="text"
              color={btnProps.color}
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenPreview();
              }}
              sx={{ fontWeight: "700", fontSize: 13 }}
            >
              {btnProps.text}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* ─── بوب آب العرض الداخلي للمحتوى والاختبار ─── */}
      <Dialog
        open={openPreview}
        onClose={() => setOpenPreview(false)}
        fullWidth
        maxWidth="md"
        PaperProps={{ sx: { borderRadius: 4, overflow: "hidden" } }}
      >
        <DialogTitle
          sx={{
            m: 0,
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            bgcolor: "grey.50",
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            {isQuiz && quizDetails ? `📋 ${quizDetails.quizName}` : lesson.title}
          </Typography>
          <IconButton onClick={() => setOpenPreview(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent
          dividers
          sx={{
            p: isQuiz ? 3 : 0,
            bgcolor: isQuiz ? "#f8f9fa" : "#111",
            display: "flex",
            flexDirection: "column",
            minHeight: 300,
          }}
        >
          {/* 🔹 1. عرض بيانات الاختبار إذا كان الدرس اختباراً */}
          {isQuiz ? (
            loadingQuiz ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  py: 6,
                  width: "100%",
                }}
              >
                <CircularProgress size={40} sx={{ mb: 2 }} />
                <Typography color="text.secondary">جاري تحميل بيانات الاختبار...</Typography>
              </Box>
            ) : quizError ? (
              <Alert severity="error" sx={{ my: 2 }}>
                {quizError}
              </Alert>
            ) : quizDetails ? (
              <Box sx={{ width: "100%", direction: "rtl" }}>
                <Box
                  sx={{
                    bgcolor: "primary.50",
                    p: 2,
                    borderRadius: 2,
                    mb: 3,
                    border: "1px solid",
                    borderColor: "primary.200",
                  }}
                >
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    spacing={1}
                  >
                    <Typography variant="subtitle1" fontWeight="bold" color="primary.dark">
                      عدد الأسئلة: {quizDetails.questions?.length || 0}
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary">
                      متاح حتى:{" "}
                      {quizDetails.availableUntil
                        ? new Date(quizDetails.availableUntil).toLocaleString("ar-EG")
                        : "غير محدد"}
                    </Typography>
                  </Stack>
                </Box>

                <Stack spacing={2.5}>
                  {quizDetails.questions && quizDetails.questions.length > 0 ? (
                    quizDetails.questions.map((q, qIndex) => (
                      <Paper
                        key={q.questionID || qIndex}
                        variant="outlined"
                        sx={{ p: 2.5, borderRadius: 3, bgcolor: "#ffffff" }}
                      >
                        <Stack direction="row" justifyContent="space-between" mb={1.5}>
                          <Typography variant="body1" fontWeight="bold">
                            {qIndex + 1}. {q.questionText}
                          </Typography>
                          <Chip
                            label={`${q.score} درجة`}
                            color="primary"
                            size="small"
                            variant="outlined"
                          />
                        </Stack>

                        {q.typeName && (
                          <Chip
                            label={q.typeName}
                            size="small"
                            sx={{ mb: 1.5, bgcolor: "grey.100", fontSize: 11 }}
                          />
                        )}

                        <Stack spacing={1} sx={{ mt: 1 }}>
                          {q.options && q.options.length > 0 ? (
                            q.options.map((opt, optIndex) => (
                              <Box
                                key={opt.optionID || optIndex}
                                sx={{
                                  p: 1.2,
                                  px: 2,
                                  borderRadius: 2,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  bgcolor: opt.isCorrect ? "#e8f5e9" : "#fafafa",
                                  border: "1px solid",
                                  borderColor: opt.isCorrect ? "#a5d6a7" : "#e0e0e0",
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  fontWeight={opt.isCorrect ? "bold" : "normal"}
                                  color={opt.isCorrect ? "success.dark" : "text.primary"}
                                >
                                  {opt.optionText}
                                </Typography>
                                {opt.isCorrect ? (
                                  <Stack direction="row" alignItems="center" spacing={0.5}>
                                    <Typography variant="caption" color="success.dark" fontWeight="bold">
                                      الإجابة الصحيحة
                                    </Typography>
                                    <CheckCircleOutlineIcon color="success" fontSize="small" />
                                  </Stack>
                                ) : (
                                  <CancelOutlinedIcon
                                    sx={{ color: "grey.400" }}
                                    fontSize="small"
                                  />
                                )}
                              </Box>
                            ))
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              لا توجد خيارات لهذا السؤال
                            </Typography>
                          )}
                        </Stack>
                      </Paper>
                    ))
                  ) : (
                    <Typography textAlign="center" color="text.secondary">
                      لا توجد أسئلة مضافة في هذا الاختبار حالياً.
                    </Typography>
                  )}
                </Stack>
              </Box>
            ) : null
          ) : lessonUrl ? (
            /* 🔹 2. عرض المحتوى العادي (فيديو / PDF / صورة) */
            <Box
              sx={{
                width: "100%",
                height: { xs: 300, sm: 450, md: 500 },
                overflow: "hidden",
              }}
            >
              {isVideoContent ? (
                <iframe
                  width="100%"
                  height="100%"
                  src={getEmbedUrl(lessonUrl, lesson)}
                  title={lesson.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : type === "pdf" || type === "image" ? (
                <embed
                  src={lessonUrl}
                  type={type === "pdf" ? "application/pdf" : "image/*"}
                  width="100%"
                  height="100%"
                />
              ) : (
                <iframe
                  src={lessonUrl}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  title="Content-Preview"
                  allowFullScreen
                />
              )}
            </Box>
          ) : (
            <Box sx={{ p: 4, color: "#fff", textAlign: "center" }}>
              <Typography>⚠️ عذراً، لا يوجد رابط متوفر لعرضه حالياً.</Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 1.5, bgcolor: "grey.50" }}>
          <Button
            onClick={() => setOpenPreview(false)}
            variant="outlined"
            color="inherit"
            sx={{ borderRadius: 2 }}
          >
            إغلاق النافذة
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}