// StudentExercisesTab.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Paper,
  Grid,
  Box,
  Typography,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import axiosInstance from "../../api/axiosInstance";
import { useSearchParams } from "react-router-dom";
import QuestionCard from "./QuestionCard";
import ResultSummary from "./ResultSummary";
import FloatingSearchBox from "./FloatingSearchBox";

export default function StudentExercisesTab() {
  const [searchParams] = useSearchParams();

  // 🔹 جلب البيانات المطلوبة من URL
  const paramQuizId = searchParams.get("quizId");
  const paramGroupId = searchParams.get("groupId") || searchParams.get("teacherGroupId");
  const paramContentUrl = searchParams.get("contentUrl") || searchParams.get("contentURL");

  const [activeQuizId, setActiveQuizId] = useState(null);
  const [loading, setLoading] = useState(true);

  const [questionsList, setQuestionsList] = useState([]);
  const [quizInfo, setQuizInfo] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [orderBy, setOrderBy] = useState("score");
  const [order, setOrder] = useState("asc");
  const [studentAnswers, setStudentAnswers] = useState({});
  const [unanswered, setUnanswered] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState({ score: 0, percentage: 0 });
  const [wrongAnswers, setWrongAnswers] = useState([]);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "info" });

  const closeSnack = () => setSnack((prev) => ({ ...prev, open: false }));

  // 🔹 1. تحديد رقم الـ Quiz الصحيح سواء تم تمرير quizId مباشر أو groupId
  useEffect(() => {
    const resolveQuizId = async () => {
      setLoading(true);

      // إذا كان الـ quizId متوفراً بشكل مباشر
      if (paramQuizId && Number(paramQuizId) > 0) {
        setActiveQuizId(Number(paramQuizId));
        return;
      }

      // إذا كان contentUrl يحمل رقم الاختبار
      if (paramContentUrl && !isNaN(paramContentUrl.trim())) {
        setActiveQuizId(Number(paramContentUrl.trim()));
        return;
      }

      // إذا تم تمرير groupId، نجلب دروس المجموعة لنبحث عن الدرس الذي يحوي quizId
      if (paramGroupId) {
        try {
          const res = await axiosInstance.get(`/Lessons/GetByGroupID/${paramGroupId}`);
          if (res.data?.success && Array.isArray(res.data?.data)) {
            // البحث عن درس الاختبار من القائمة بناءً على الهيكلية الجديدة
            const quizLesson = res.data.data.find(
              (item) => Number(item.contentTypeId) === 3 || Number(item.quizId) > 0
            );

            if (quizLesson && quizLesson.quizId) {
              setActiveQuizId(Number(quizLesson.quizId));
              return;
            }
          }
        } catch (err) {
          console.error("خطأ أثناء جلب دروس المجموعة:", err);
        }
      }

      // قيمة افتراضية إذا لم يتوفر أي مصدر
      setActiveQuizId(16);
    };

    resolveQuizId();
  }, [paramQuizId, paramGroupId, paramContentUrl]);

  // 🔹 2. جلب تفاصيل أسئلة الاختبار عند استقرار الـ activeQuizId
  const fetchQuestions = useCallback(async () => {
    if (!activeQuizId) return;

    setLoading(true);
    try {
      const res = await axiosInstance.get(`/Quizzes/GetByID/${activeQuizId}`);

      if (res.data?.success && res.data?.data) {
        const quizData = res.data.data;

        setQuizInfo({
          quizID: quizData.quizID,
          quizName: quizData.quizName,
          availableUntil: quizData.availableUntil,
        });

        // إعادة تشكيل أسئلة الاختبار
        const formattedQuestions = (quizData.questions || []).map((q) => ({
          questionId: q.questionID,
          questionText: q.questionText || "",
          score: q.score || 0,
          questionTypeId: q.questionTypeID || 1,
          typeName: q.typeName || "",
          answers: (q.options || []).map((opt) => ({
            optionId: opt.optionID,
            optionText: opt.optionText || "",
            isCorrect: opt.isCorrect,
          })),
        }));

        setQuestionsList(formattedQuestions);
      } else {
        setSnack({
          open: true,
          message: res.data?.message || "فشل جلب بيانات الاختبار",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("خطأ أثناء جلب أسئلة الاختبار:", error);
      setSnack({
        open: true,
        message: "حدث خطأ أثناء تحميل أسئلة الاختبار ❌",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [activeQuizId]);

  useEffect(() => {
    if (activeQuizId) {
      fetchQuestions();
    }
  }, [activeQuizId, fetchQuestions]);

  // 🔹 الفلترة والفرز
  const filteredAndSorted = useMemo(
    () =>
      questionsList
        .filter((q) =>
          (q.questionText || "")
            .toLowerCase()
            .includes((searchQuery || "").toLowerCase())
        )
        .sort((a, b) =>
          a.questionTypeId !== b.questionTypeId
            ? a.questionTypeId - b.questionTypeId
            : order === "asc"
            ? (a[orderBy] || 0) - (b[orderBy] || 0)
            : (b[orderBy] || 0) - (a[orderBy] || 0)
        ),
    [questionsList, searchQuery, orderBy, order]
  );

  const handleAnswerChange = (questionId, optionId, isChecked, isText = false) => {
    setStudentAnswers((prev) => {
      let current = prev[questionId] || { optionIDs: [], answerText: "" };

      if (isText) return { ...prev, [questionId]: { ...current, answerText: optionId } };

      const optIdNum = Number(optionId);
      const qType = questionsList.find((q) => q.questionId === questionId)?.questionTypeId;

      if (qType === 2) return { ...prev, [questionId]: { ...current, optionIDs: [optIdNum] } };

      let newOptions = [...(current.optionIDs || [])];
      isChecked
        ? !newOptions.includes(optIdNum) && newOptions.push(optIdNum)
        : (newOptions = newOptions.filter((id) => id !== optIdNum));

      return { ...prev, [questionId]: { ...current, optionIDs: newOptions } };
    });

    if (unanswered.includes(questionId)) {
      setUnanswered((prev) => prev.filter((id) => id !== questionId));
    }
  };

  const calculateResult = (questions, answers) => {
    let score = 0;
    let wrongs = [];

    questions.forEach((q) => {
      const studentAns = answers[q.questionId];
      let isCorrect = false;

      if (q.questionTypeId === 3) {
        isCorrect = true;
      } else {
        const correctOptions = q.answers.filter((a) => a.isCorrect).map((a) => a.optionId).sort();
        const studentOptions = (studentAns?.optionIDs || []).sort();
        isCorrect = JSON.stringify(correctOptions) === JSON.stringify(studentOptions);
      }

      if (isCorrect) score += (q.score || 0);
      else wrongs.push(q.questionId);
    });

    const totalPossibleScore = questions.reduce((s, q) => s + (q.score || 0), 0);
    const percentage = totalPossibleScore > 0 ? ((score / totalPossibleScore) * 100).toFixed(2) : 0;

    return { score, percentage, wrongs };
  };

  const handleSubmitAnswers = async () => {
    const missing = questionsList.filter((q) => {
      const ans = studentAnswers[q.questionId];
      if (!ans) return true;
      if (q.questionTypeId === 3 && !ans.answerText?.trim()) return true;
      if (q.questionTypeId !== 3 && (!ans.optionIDs || ans.optionIDs.length === 0)) return true;
      return false;
    });

    if (missing.length > 0) {
      setUnanswered(missing.map((q) => q.questionId));
      setSnack({ open: true, message: "⚠️ يوجد أسئلة لم يتم الإجابة عليها!", severity: "warning" });
      return;
    }

    const { score, percentage, wrongs } = calculateResult(questionsList, studentAnswers);
    setResult({ score, percentage });
    setWrongAnswers(wrongs);
    setSubmitted(true);

    try {
      const payload = {
        studentID: 1,
        quizID: Number(activeQuizId),
        answers: Object.entries(studentAnswers).map(([qId, ans]) => ({
          questionID: Number(qId),
          answerText: ans.answerText || null,
          optionIDs: ans.optionIDs?.length ? ans.optionIDs.join(",") : null,
        })),
      };
      await axiosInstance.post("/StudentAnswers/InsertBatch", payload);
      setSnack({ open: true, message: "تم إرسال الإجابات وحساب الدرجات ✅", severity: "success" });
    } catch (error) {
      console.error("Error submitting answers:", error);
      setSnack({ open: true, message: "تم الحساب لكن لم يتم الحفظ في السيرفر ❌", severity: "error" });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "300px" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, backgroundColor: "#eef2f7" }}>
      {/* الأدوات */}
      <FloatingSearchBox
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <Paper
        sx={{
          p: { xs: 2, sm: 3 },
          maxWidth: 1300,
          mx: "auto",
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        }}
      >
        {/* عنوان وملخص الاختبار */}
        {quizInfo && (
          <Typography variant="h5" color="primary" sx={{ fontWeight: "bold", mb: 1 }}>
            {quizInfo.quizName}
          </Typography>
        )}

        <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 2 }}>
          عدد الأسئلة: {questionsList.length}
        </Typography>

        {/* الأسئلة */}
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {filteredAndSorted.map((q, idx) => (
            <Grid item xs={12} key={q.questionId} sx={{ width: "100%" }}>
              <QuestionCard
                q={q}
                idx={idx}
                unanswered={unanswered}
                wrongAnswers={wrongAnswers}
                submitted={submitted}
                studentAnswers={studentAnswers}
                handleAnswerChange={handleAnswerChange}
              />
            </Grid>
          ))}
        </Grid>

        {/* زر الإرسال */}
        {!submitted && (
          <Box sx={{ mt: 4, textAlign: "center" }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleSubmitAnswers}
              sx={{ borderRadius: "10px", px: 5, py: 1.5, fontWeight: "bold", fontSize: "1rem" }}
            >
              إرسال الإجابات
            </Button>
          </Box>
        )}
      </Paper>

      {/* ملخص النتيجة */}
      {submitted && <ResultSummary result={result} />}

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={closeSnack}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snack.severity} onClose={closeSnack} variant="filled">
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}