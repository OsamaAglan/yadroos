import React from "react";
import { Typography, Box, Button, LinearProgress, Chip, Grid } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import HelpIcon from "@mui/icons-material/SplitscreenSharp";

const QuestionCard = ({ question, onEdit, onDelete }) => {
  // 🔹 دعم التسميتين (options القادمة من الـ API أو answers) مع وضع قيمة افتراضية لتجنب خطأ undefined
  const optionsList = question?.options || question?.answers || [];

  const correctIndexes = optionsList
    .map((answer, idx) => (answer?.isCorrect ? idx : null))
    .filter((idx) => idx !== null);

  const correctCount = question?.correctAnswers || 0;
  const wrongCount = question?.wrongAnswers || 0;
  
  // 🔹 دعم مسمى questionTypeID من API
  const TypeId = question?.questionTypeID || question?.questionTypeId || 0;
  const totalAttempts = correctCount + wrongCount;

  let difficulty = "غير محدد";
  let successRate = 0;
  if (totalAttempts > 0) {
    successRate = (correctCount / totalAttempts) * 100;
    if (successRate >= 70) difficulty = "سهل";
    else if (successRate >= 40) difficulty = "متوسط";
    else difficulty = "صعب";
  }

  const difficultyColor =
    difficulty === "سهل" ? "success" : difficulty === "متوسط" ? "warning" : "error";

  const questionTypes = {
    1: { label: "اختياري", color: "primary" },
    2: { label: "صح/خطأ", color: "success" },
    3: { label: "مقالي", color: "secondary" },
  };

  const qType = questionTypes[TypeId] || {
    label: "غير معروف",
    color: "default",
    icon: <HelpIcon />,
  };

  // 🔹 جلب المعرف بناءً على التسميات المتاحة
  const qId = question?.questionID || question?.questionId;

  return (
    <Grid item xs={12} sm={6} md={4} lg={3}>
      <Box
        sx={{
          position: "relative",
          border: "1px solid #ddd",
          borderRadius: "10px",
          padding: "10px",
          margin: "6px 0",
          backgroundColor: "#fff",
          boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
          minHeight: "220px",
        }}
      >
        {/* شارة الدرجات */}
        <Box
          sx={{
            position: "absolute",
            top: "-8px",
            right: "-8px",
            background: "linear-gradient(135deg, #FFD700, #FFA500)",
            color: "#fff",
            fontWeight: "bold",
            borderRadius: "50%",
            width: "38px",
            height: "38px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
            fontSize: "0.9rem",
          }}
        >
          {question?.score || 0}
        </Box>

        {/* عنوان السؤال */}
        <Typography
          variant="subtitle1"
          gutterBottom
          sx={{
            fontWeight: "bold",
            color: "#1976d2",
            fontSize: "0.95rem",
            textAlign: "center",
            mb: 1,
          }}
        >
          {qId ? `${qId}. ` : ""}{question?.questionText || "بدون عنوان"}
        </Typography>

        {/* نوع السؤال */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
          <Chip label={qType.label} color={qType.color} size="small" />
        </Box>

        {/* الإجابات / الخيارات */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {optionsList.length > 0 ? (
            optionsList.map((answer, i) => {
              const isCorrect = correctIndexes.includes(i);
              return (
                <Box
                  key={answer?.optionID || i}
                  sx={{
                    padding: "6px 10px",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                    backgroundColor: isCorrect ? "#d4edda" : "#f8d7da",
                    fontSize: "0.85rem",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {i + 1} - {answer?.optionText}
                </Box>
              );
            })
          ) : (
            <Typography variant="caption" sx={{ textAlign: "center", color: "#888" }}>
              لا توجد خيارات متاحة
            </Typography>
          )}
        </Box>

        {/* الإحصائيات */}
        <Typography
          variant="caption"
          sx={{ display: "block", textAlign: "center", mt: 1, fontWeight: "bold" }}
        >
          ✅ {correctCount} | ❌ {wrongCount}
        </Typography>

        {/* مستوى الصعوبة */}
        <Box sx={{ mt: 1 }}>
          <Typography
            variant="caption"
            sx={{ display: "block", textAlign: "center", fontWeight: "bold", mb: 0.5 }}
          >
            {difficulty} ({successRate.toFixed(0)}%)
          </Typography>
          <LinearProgress
            variant="determinate"
            value={successRate}
            color={difficultyColor}
            sx={{ height: 6, borderRadius: "3px" }}
          />
        </Box>

        {/* الأزرار */}
        <Box sx={{ display: "flex", justifyContent: "center", gap: "6px", mt: 1 }}>
          <Button
            variant="outlined"
            color="primary"
            size="small"
            startIcon={<EditIcon />}
            onClick={() => onEdit && onEdit(question)}
          >
            تعديل
          </Button>
          <Button
            variant="outlined"
            color="error"
            size="small"
            startIcon={<DeleteIcon />}
            onClick={() => onDelete && onDelete(qId)}
          >
            حذف
          </Button>
        </Box>
      </Box>
    </Grid>
  );
};

export default QuestionCard;