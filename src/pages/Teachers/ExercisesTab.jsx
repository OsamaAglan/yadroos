import React, { useState, useEffect, useMemo } from "react";
import {
  Paper,
  Divider,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  IconButton,
  Tooltip,
  TextField,
  Typography,
  Collapse,
  Chip,
  Switch,
  FormControlLabel,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Edit, Delete, ExpandMore, ExpandLess, Save } from "@mui/icons-material";
import QuestionCard from "../../components/Teachers/QuestionCard";
import AddQuestionForm from "../../components/Teachers/AddQuestionForm";
import axiosInstance from "../../api/axiosInstance";
import { useSearchParams } from "react-router-dom";

export default function ExercisesTab({ gradeName, term, groupName }) {
  const [searchParams] = useSearchParams();
  const groupId = searchParams.get("groupId");

  // 🔹 حالة بيانات الاختبار الأساسية (Header)
  const [quizHeader, setQuizHeader] = useState({
    quizID: 0,
    quizName: "",
    teacherGroupID: Number(groupId) || 0,
    available: true,
    availableUntil: "",
  });

  const [savingQuiz, setSavingQuiz] = useState(false);

  // 🔹 حالة الأسئلة (Details)
  const [quizDetails, setQuizDetails] = useState([]);

  const [openForm, setOpenForm] = useState(false);
  const [editData, setEditData] = useState(null);

  const [viewMode, setViewMode] = useState(
    localStorage.getItem("viewMode") || "cards"
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [orderBy, setOrderBy] = useState("score");
  const [order, setOrder] = useState("asc");
  const [expandedRows, setExpandedRows] = useState([]);

  // Responsive
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));

  const toggleViewMode = () => {
    const newMode = viewMode === "cards" ? "table" : "cards";
    setViewMode(newMode);
    localStorage.setItem("viewMode", newMode);
  };

  const questionTypeMap = {
    1: "اختيار من متعدد",
    2: "صح / خطأ",
    3: "مقالي",
  };

  // تحويل صيغة التاريخ لملائمة مدخل datetime-local
  const formatDateTimeForInput = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "";
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  // 🔹 جلب بيانات الاختبار والأسئلة
  const fetchQuizData = async () => {
    try {
      const res = await axiosInstance.get(`/Quizzes/GetByGroupID/${groupId}`);
      if (res.data?.data) {
        const data = res.data.data;
        setQuizHeader({
          quizID: data.quizID || 0,
          quizName: data.quizName || "",
          teacherGroupID: Number(groupId),
          available: data.available ?? true,
          availableUntil: data.availableUntil || "",
        });

        const dtlData = data.questions || [];
        setQuizDetails(dtlData);
      }
    } catch (error) {
      console.error("خطأ في جلب بيانات الاختبار:", error);
    }
  };

  useEffect(() => {
    if (groupId) {
      fetchQuizData();
    }
  }, [groupId]);

  // 🔹 إضافة/تحديث سؤال في القائمة المحلية الموقتة
  const handleSaveQuestionLocally = (data) => {
    const isNewQuestion = !editData || !editData.questionID || editData.questionID === 0;

    // تصفية الخيارات للتأكد من عدم وجود خيارات فارغة النص
    const validAnswers = (data.answers || []).filter(
      (a) => a.optionText && a.optionText.trim() !== ""
    );

    const formattedQuestion = {
      action: isNewQuestion ? "a" : "u",
      quizID: quizHeader.quizID || 0,
      questionID: isNewQuestion ? 0 : editData.questionID,
      questionText: data.questionText,
      score: Number(data.score),
      questionTypeID: Number(data.questionTypeId),
      typeName: questionTypeMap[data.questionTypeId] || "اختيار من متعدد",
      askedIn: data.askedIn || "string",
      active: data.active ?? true,
      options: validAnswers.map((a) => ({
        action: !a.optionID || a.optionID === 0 ? "a" : "u",
        optionID: a.optionID || 0,
        questionID: isNewQuestion ? 0 : editData.questionID,
        optionText: a.optionText.trim(),
        isCorrect: Boolean(a.isCorrect),
      })),
    };

    if (!isNewQuestion) {
      setQuizDetails((prev) =>
        prev.map((q) => (q.questionID === editData.questionID ? formattedQuestion : q))
      );
    } else {
      setQuizDetails((prev) => [...prev, formattedQuestion]);
    }

    setOpenForm(false);
    setEditData(null);
  };

  // 🔹 حفظ الاختبار كاملاً (Header + Details) بإرسال الطلب إلى الـ API
  const handleSaveAllQuiz = async () => {
    if (!quizHeader.quizName.trim()) {
      alert("يرجى إدخال اسم الاختبار أولاً");
      return;
    }

    if (quizHeader.available && !quizHeader.availableUntil) {
      alert("يرجى تحديد تاريخ ووقت الإتاحة طالما أن الاختبار متاح");
      return;
    }

    if (quizDetails.length === 0) {
      alert("يرجى إضافة سؤال واحد على الأقل قبل الحفظ");
      return;
    }

    try {
      setSavingQuiz(true);

      const payload = {
        quizID: Number(quizHeader.quizID) || 0,
        teacherGroupID: Number(groupId),
        quizName: quizHeader.quizName.trim(),
        available: quizHeader.available,
        availableUntil:
          quizHeader.available && quizHeader.availableUntil
            ? new Date(quizHeader.availableUntil).toISOString()
            : null,
        questions: quizDetails.map((q) => {
          // تصحيح الـ Action تلقائياً بناءً على الـ questionID
          const isNewQuestion = !q.questionID || Number(q.questionID) === 0;
          const questionAction = isNewQuestion ? "a" : q.action || "a";

          return {
            action: questionAction,
            quizID: Number(q.quizID) || 0,
            questionID: Number(q.questionID) || 0,
            questionText: q.questionText,
            score: Number(q.score) || 0,
            questionTypeID: Number(q.questionTypeID) || 1,
            typeName: q.typeName || "اختيار من متعدد",
            askedIn: q.askedIn || "string",
            active: Boolean(q.active),
            options: (q.options || [])
              .filter((opt) => opt.optionText && opt.optionText.trim() !== "") // إستبعاد أي خيار فارغ
              .map((opt) => ({
                action: !opt.optionID || Number(opt.optionID) === 0 ? "a" : opt.action || "a",
                optionID: Number(opt.optionID) || 0,
                questionID: Number(opt.questionID) || 0,
                optionText: opt.optionText.trim(),
                isCorrect: Boolean(opt.isCorrect),
              })),
          };
        }),
      };

      console.log("Payload to send:", payload); // للمعاينة في الـ Console

      const response = await axiosInstance.post("/Quizzes/Insert", payload);

      if (response?.data?.success || response?.status === 200) {
        await fetchQuizData();
        alert("تم حفظ الاختبار والأسئلة بنجاح!");
      }
    } catch (error) {
      console.error("خطأ في حفظ الاختبار:", error);
      alert("حدث خطأ أثناء حفظ الاختبار: " + (error.response?.data?.message || "تأكد من إدخال نصوص الاختيارات بشكل صحيح"));
    } finally {
      setSavingQuiz(false);
    }
  };

  // 🔹 حذف سؤال محلياً
  const handleDelete = (id) => {
    setQuizDetails((prev) => prev.filter((q) => q.questionID !== id));
  };

  // 🔹 الفلترة والترتيب
  const filteredAndSorted = useMemo(() => {
    let data = [...quizDetails];
    if (searchQuery) {
      data = data.filter((q) =>
        q.questionText?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return data.sort((a, b) => {
      let aValue = a[orderBy];
      let bValue = b[orderBy];

      if (order === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [quizDetails, searchQuery, orderBy, order]);

  const toggleExpand = (id) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const totalQuestions = quizDetails.length;
  const totalScore = quizDetails.reduce((acc, q) => acc + (Number(q.score) || 0), 0);

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, backgroundColor: "#f5f6fa" }}>
      <Paper
        sx={{
          p: { xs: 2, sm: 3 },
          maxWidth: 1300,
          margin: "auto",
          borderRadius: "16px",
          boxShadow: 4,
        }}
      >
        {openForm ? (
          <AddQuestionForm
            onSave={handleSaveQuestionLocally}
            onCancel={() => {
              setOpenForm(false);
              setEditData(null);
            }}
            groupId={groupId}
            termId={term}
            gradeId={gradeName}
            initialData={editData}
          />
        ) : (
          <>
            {/* 🔹 بيانات الاختبار الأساسية */}
            <Paper
              elevation={2}
              sx={{ p: 2.5, mb: 3, borderRadius: "12px", backgroundColor: "#ffffff" }}
            >
              <Typography variant="h6" color="primary" sx={{ fontWeight: "bold", mb: 2 }}>
                📋 بيانات الاختبار الأساسية
              </Typography>

              <Grid container spacing={2} alignItems="center">
                {/* 1. اسم الاختبار */}
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="اسم الاختبار"
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={quizHeader.quizName}
                    onChange={(e) =>
                      setQuizHeader((prev) => ({ ...prev, quizName: e.target.value }))
                    }
                  />
                </Grid>

                {/* 2. حالة الاختبار */}
                <Grid item xs={12} sm={3}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={Boolean(quizHeader.available)}
                        onChange={(e) => {
                          const isChecked = e.target.checked;
                          setQuizHeader((prev) => ({
                            ...prev,
                            available: isChecked,
                            availableUntil: isChecked ? prev.availableUntil : "",
                          }));
                        }}
                        color="success"
                      />
                    }
                    label={quizHeader.available ? "متاح" : "غير متاح"}
                  />
                </Grid>

                {/* 3. متاح حتى */}
                <Grid item xs={12} sm={5}>
                  <TextField
                    label="متاح حتى"
                    type="datetime-local"
                    variant="outlined"
                    size="small"
                    fullWidth
                    disabled={!quizHeader.available}
                    required={quizHeader.available}
                    InputLabelProps={{ shrink: true }}
                    value={formatDateTimeForInput(quizHeader.availableUntil)}
                    onChange={(e) =>
                      setQuizHeader((prev) => ({
                        ...prev,
                        availableUntil: e.target.value,
                      }))
                    }
                  />
                </Grid>
              </Grid>
            </Paper>

            <Divider sx={{ mb: 3 }} />

            {/* 🔹 شريط الأدوات */}
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 2,
                mb: 2,
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  variant="contained"
                  size="large"
                  sx={{
                    backgroundColor: "#2e7d32",
                    "&:hover": { backgroundColor: "#1b5e20" },
                    fontWeight: "bold",
                    borderRadius: "10px",
                  }}
                  onClick={() => {
                    setEditData(null); // تفريغ بيانات التعديل لضمان اعتبار السؤال جديد ("a")
                    setOpenForm(true);
                  }}
                >
                  ➕ إضافة سؤال
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    borderColor: "#1565c0",
                    color: "#1565c0",
                    fontWeight: "bold",
                    borderRadius: "10px",
                  }}
                  onClick={toggleViewMode}
                >
                  {viewMode === "cards" ? "📋 جدول" : "🗂️ بطاقات"}
                </Button>
              </Box>

              {/* زر الحفظ النهائي للكل */}
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<Save />}
                disabled={savingQuiz}
                onClick={handleSaveAllQuiz}
                sx={{
                  fontWeight: "bold",
                  borderRadius: "10px",
                  px: 4,
                  "& .MuiButton-startIcon": {
                    marginInlineEnd: "8px",
                    marginInlineStart: 0,
                  },
                }}
              >
                حفظ الاختبار بالكامل
              </Button>
            </Box>

            <Box sx={{ mb: 2 }}>
              <TextField
                label="🔍 بحث في الأسئلة"
                variant="outlined"
                size="small"
                fullWidth={isSmall}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </Box>

            {/* 🔹 الملخص */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1">
                إجمالي الأسئلة: <b>{totalQuestions}</b> | مجموع الدرجات: <b>{totalScore}</b>
              </Typography>
            </Box>

            {/* 🔹 العرض (جدول / بطاقات) */}
            {viewMode === "cards" ? (
              <Grid container spacing={2} sx={{ mt: 2 }}>
                {filteredAndSorted.map((q, idx) => (
                  <Grid item xs={12} sm={6} md={4} key={q.questionID || idx}>
                    <QuestionCard
                      question={q}
                      groupId={groupId}
                      onEdit={() => {
                        setEditData(q);
                        setOpenForm(true);
                      }}
                      onDelete={() => handleDelete(q.questionID)}
                    />
                  </Grid>
                ))}
              </Grid>
            ) : (
              /* 🔹 جدول التفاصيل */
              <TableContainer
                component={Paper}
                sx={{
                  mt: 2,
                  direction: "rtl",
                  borderRadius: "12px",
                  overflowX: "auto",
                  boxShadow: 3,
                }}
              >
                <Table size="small">
                  <TableHead sx={{ backgroundColor: "#1565c0" }}>
                    <TableRow>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>#</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>السؤال</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>الدرجة</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>النوع</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>سُئل في</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>الحالة</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>إجراءات</TableCell>
                      <TableCell />
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {filteredAndSorted.map((q, idx) => (
                      <React.Fragment key={q.questionID || idx}>
                        <TableRow
                          sx={{
                            backgroundColor: idx % 2 === 0 ? "#fcfcfc" : "#ffffff",
                            "& td": { py: 1, fontWeight: 500 },
                          }}
                        >
                          <TableCell>{idx + 1}</TableCell>
                          <TableCell>{q.questionText}</TableCell>
                          <TableCell>{q.score}</TableCell>
                          <TableCell>
                            {questionTypeMap[q.questionTypeID] || "غير معروف"}
                          </TableCell>
                          <TableCell>{q.askedIn || "-"}</TableCell>
                          <TableCell>
                            <Chip
                              label={q.active ? "نشط" : "غير نشط"}
                              color={q.active ? "success" : "default"}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Tooltip title="تعديل">
                              <IconButton
                                color="primary"
                                onClick={() => {
                                  setEditData(q);
                                  setOpenForm(true);
                                }}
                              >
                                <Edit />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="حذف">
                              <IconButton
                                color="error"
                                onClick={() => handleDelete(q.questionID)}
                              >
                                <Delete />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                          <TableCell>
                            <IconButton onClick={() => toggleExpand(q.questionID || idx)}>
                              {expandedRows.includes(q.questionID || idx) ? (
                                <ExpandLess />
                              ) : (
                                <ExpandMore />
                              )}
                            </IconButton>
                          </TableCell>
                        </TableRow>

                        {/* عرض الاختيارات المتاحة للسؤال */}
                        <TableRow>
                          <TableCell colSpan={8} sx={{ p: 0 }}>
                            <Collapse
                              in={expandedRows.includes(q.questionID || idx)}
                              timeout="auto"
                              unmountOnExit
                            >
                              <Box sx={{ p: 2, backgroundColor: "#f9f9f9" }}>
                                {Array.isArray(q.options) &&
                                  q.options.map((ans, i) => (
                                    <Typography
                                      key={ans.optionID || i}
                                      sx={{
                                        color: ans.isCorrect ? "green" : "red",
                                      }}
                                    >
                                      {i + 1}- {ans.optionText}{" "}
                                      {ans.isCorrect ? "✔️" : "❌"}
                                    </Typography>
                                  ))}
                              </Box>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </>
        )}
      </Paper>
    </Box>
  );
}