import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Stack,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";

// أيقونات
import PlayCircleFilledWhiteIcon from "@mui/icons-material/PlayCircleFilledWhite";
import VisibilityIcon from "@mui/icons-material/Visibility";
import QuizIcon from "@mui/icons-material/Quiz";
import LockIcon from "@mui/icons-material/Lock";
import CloseIcon from "@mui/icons-material/Close";
import TagIcon from "@mui/icons-material/Tag";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import { getEmbedUrl } from "../../utils/mediaUtils";

const DEFAULT_BG =
  "https://yadroosdev.com-eg.net//uploads/teachers/1006/profile/be661c32-3959-47ea-bc37-9aecf83b63cd_IMG_1088.png";

export default function StudentLessonCard({ lesson, onOpenQuiz, onRequestSubscribe }) {
  const [openPreview, setOpenPreview] = useState(false);

  const currentImage = lesson.lessonImagePath || DEFAULT_BG;

  // 🛡️ استخراج الرابط بناءً على الاستجابة الجديدة للـ API (videoUrl, docUrl, contentUrl)
  const lessonUrl = (
    lesson.videoUrl ||
    lesson.docUrl ||
    lesson.contentUrl ||
    lesson.contentURL ||
    ""
  ).trim();

  // 🛡️ تحديد رقم/معرف الاختبار
  const resolvedQuizId = lesson.quizId || lessonUrl || lesson.lessonId;

  // 🛡️ تحديد نوع المحتوى
  const typeNameLower = (lesson.typeName || "").toLowerCase();
  const isQuiz =
    Number(lesson.contentTypeId) === 3 ||
    Number(lesson.contentTypeID) === 3 ||
    Number(lesson.quizId) > 0 ||
    typeNameLower.includes("quiz") ||
    typeNameLower.includes("test") ||
    typeNameLower.includes("exam") ||
    typeNameLower.includes("اختبار");

  const isVideoContent =
    typeNameLower === "video" ||
    Boolean(lesson.videoUrl) ||
    lesson.isYoutube ||
    Number(lesson.contentTypeId) === 1;

  // تحديد حالة وصول الطالب للدرس
  // 1. درس مجاني -> متاح تلقائياً
  // 2. hasAccess -> متاح عبر الاشتراك
  // 3. isPending -> الطلب قيد الانتظار
  const isFree = Boolean(lesson.isFree);
  const hasAccess = isFree || Boolean(lesson.hasAccess) || Boolean(lesson.isSubscribed);
  const isPending = lesson.subscriptionStatus === "Pending" || lesson.isPending;

  // فتح معاينة الدرس أو الاختبار
  const handleAction = () => {
    if (!hasAccess) {
      if (!isPending && onRequestSubscribe) {
        onRequestSubscribe(lesson);
      }
      return;
    }

    if (isQuiz) {
      if (onOpenQuiz) {
        onOpenQuiz(resolvedQuizId);
      }
      return;
    }

    setOpenPreview(true);
  };

  // خصائص الزر واللافتة حسب الحالة ونوع المحتوى
  const renderAccessButton = () => {
    if (!hasAccess) {
      if (isPending) {
        return {
          text: "قيد الموافقة",
          icon: <HourglassTopIcon />,
          color: "warning",
          variant: "outlined",
          disabled: true,
        };
      }
      return {
        text: "اشترك للحصول على الدرس",
        icon: <LockIcon />,
        color: "secondary",
        variant: "contained",
        disabled: false,
      };
    }

    if (isQuiz) {
      return { text: "بدء الاختبار", icon: <QuizIcon />, color: "success", variant: "contained" };
    }

    if (isVideoContent) {
      return { text: "مشاهدة الفيديو", icon: <PlayCircleFilledWhiteIcon />, color: "error", variant: "contained" };
    } else {
      return { text: "تصفح الملف", icon: <VisibilityIcon />, color: "primary", variant: "contained" };
    }
  };

  const btnProps = renderAccessButton();

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
          borderColor: "grey.200",
          boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.05)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            transform: "translateY(-6px)",
            boxShadow: "0px 12px 28px rgba(0, 0, 0, 0.12)",
            "& .lesson-card-image": { transform: "scale(1.06)" },
            "& .hover-overlay": { opacity: 1 },
          },
        }}
      >
        {/* الجزء العلوي: صورة الدرس والبادجات */}
        <Box
          sx={{
            height: 180,
            position: "relative",
            overflow: "hidden",
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
              filter: !hasAccess ? "blur(2px) brightness(0.7)" : "none",
            }}
          />

          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.1) 60%, rgba(0,0,0,0.6) 100%)",
            }}
          />

          {/* بادجات الحالة العليا */}
          <Stack
            direction="row"
            spacing={1}
            sx={{ position: "absolute", top: 12, right: 12, zIndex: 2 }}
          >
            <Chip
              label={isFree ? "مجاني 🎁" : hasAccess ? "مشترك 🟢" : "مدفوع 🔒"}
              size="small"
              color={isFree ? "success" : hasAccess ? "info" : "secondary"}
              sx={{ fontWeight: "bold", backdropFilter: "blur(6px)", boxShadow: 2 }}
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

          {/* الترتيب أعلى اليسار */}
          <Chip
            icon={<TagIcon style={{ fontSize: 13, color: "#fff" }} />}
            label={`درس ${lesson.lessonOrder || 1}`}
            size="small"
            sx={{
              position: "absolute",
              top: 12,
              left: 12,
              zIndex: 2,
              bgcolor: "rgba(0, 0, 0, 0.5)",
              color: "#fff",
              backdropFilter: "blur(4px)",
              fontWeight: "bold",
              fontSize: 11,
            }}
          />

          {/* طبقة التفاعل بالماوس عند الحوم (Hover Overlay) */}
          <Box
            className="hover-overlay"
            onClick={handleAction}
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "rgba(0, 0, 0, 0.45)",
              opacity: 0,
              transition: "opacity 0.3s ease",
              cursor: btnProps.disabled ? "default" : "pointer",
              zIndex: 2,
            }}
          >
            <Button
              variant={btnProps.variant}
              color={btnProps.color}
              startIcon={btnProps.icon}
              size="medium"
              disabled={btnProps.disabled}
              sx={{ borderRadius: 3, fontWeight: "bold", px: 3, boxShadow: 4 }}
            >
              {btnProps.text}
            </Button>
          </Box>
        </Box>

        {/* تفاصيل الدرس */}
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
              label={isQuiz ? "اختبار تفاعلي" : lesson.typeName || "درس تعليمي"}
              size="small"
              variant="outlined"
              color={isQuiz ? "success" : "default"}
              sx={{ fontSize: 11, height: 22, fontWeight: 600 }}
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
              fontSize: 12.5,
              lineHeight: 1.5,
              mb: "auto",
            }}
          >
            {lesson.description || "لا يوجد وصف مضاف لهذا الدرس حالياً."}
          </Typography>

          <Divider sx={{ my: 1.5, borderColor: "grey.100" }} />

          {/* زر الإجراء السفلي */}
          <Button
            fullWidth
            variant={btnProps.variant}
            color={btnProps.color}
            startIcon={btnProps.icon}
            disabled={btnProps.disabled}
            onClick={handleAction}
            sx={{
              borderRadius: 2.5,
              fontWeight: "bold",
              py: 0.9,
              fontSize: 13,
              boxShadow: hasAccess ? 1 : 0,
              "& .MuiButton-startIcon": {
                marginInlineEnd: "8px",
                marginInlineStart: 0,
              },
            }}
          >
            {btnProps.text}
          </Button>
        </CardContent>
      </Card>

      {/* ─── بوب آب معاينة الدرس للطالب ─── */}
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
            {lesson.title}
          </Typography>
          <IconButton onClick={() => setOpenPreview(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent
          dividers
          sx={{
            p: 0,
            bgcolor: "#000",
            display: "flex",
            flexDirection: "column",
            minHeight: 350,
          }}
        >
          {lessonUrl ? (
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
              ) : typeNameLower === "pdf" || typeNameLower === "image" ? (
                <embed
                  src={lessonUrl}
                  type={typeNameLower === "pdf" ? "application/pdf" : "image/*"}
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
              <Typography>⚠️ عذراً، المحتوى غير متوفر حالياً.</Typography>
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
            إغلاق
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}