// useStudentAnswers.js
import { useState, useEffect, useMemo } from "react";
import axiosInstance from "../../api/axiosInstance";
import { useSearchParams } from "react-router-dom";

export default function useStudentAnswers() {
  const [searchParams] = useSearchParams();
  const groupId = searchParams.get("groupId");

  const [questionsList, setQuestionsList] = useState([]);
  const [viewMode, setViewMode] = useState(
    localStorage.getItem("studentViewMode") || "cards"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [orderBy] = useState("score");
  const [order] = useState("asc");
  const [expandedRows, setExpandedRows] = useState([]);
  const [studentAnswers, setStudentAnswers] = useState({});
  const [unanswered, setUnanswered] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState({ score: 0, percentage: 0 });
  const [wrongAnswers, setWrongAnswers] = useState([]);

  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const toggleViewMode = () => {
    const newMode = viewMode === "cards" ? "table" : "cards";
    setViewMode(newMode);
    localStorage.setItem("studentViewMode", newMode);
  };

  const fetchQuestions = async () => {
    try {
      const res = await axiosInstance.get(`/Questions/GetByGroupID/${groupId}`);
      const grouped = Object.values(
        res.data.data.reduce((acc, item) => {
          if (!acc[item.questionId]) {
            acc[item.questionId] = {
              questionId: item.questionId,
              questionText: item.questionText,
              score: item.score,
              questionTypeId: item.questionTypeId,
              answers: [],
            };
          }

          acc[item.questionId].answers.push({
            optionId: item.optionId,
            optionText: item.optionText,
            isCorrect: item.isCorrect,
          });
          return acc;
        }, {})
      );
      setQuestionsList(grouped);
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const filteredAndSorted = useMemo(() => {
    let data = [...questionsList];
    if (searchQuery) {
      data = data.filter((q) =>
        q.questionText.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return data.sort((a, b) => {
      if (a.questionTypeId !== b.questionTypeId) {
        return a.questionTypeId - b.questionTypeId;
      }
      return order === "asc" ? a[orderBy] - b[orderBy] : b[orderBy] - a[orderBy];
    });
  }, [questionsList, searchQuery, orderBy, order]);

  const toggleExpand = (id) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleAnswerChange = (questionId, optionId, isChecked, isText = false) => {
    setStudentAnswers((prev) => {
      let current = prev[questionId] || { optionIDs: [], answerText: "" };

      if (isText) {
        return { ...prev, [questionId]: { ...current, answerText: optionId } };
      }

      const optIdNum = Number(optionId);
      const qType = questionsList.find((q) => q.questionId === questionId)
        ?.questionTypeId;

      if (qType === 2) {
        return { ...prev, [questionId]: { ...current, optionIDs: [optIdNum] } };
      }

      let newOptions = [...(current.optionIDs || [])];
      if (isChecked) {
        if (!newOptions.includes(optIdNum)) newOptions.push(optIdNum);
      } else {
        newOptions = newOptions.filter((id) => id !== optIdNum);
      }

      return { ...prev, [questionId]: { ...current, optionIDs: newOptions } };
    });

    if (unanswered.includes(questionId)) {
      setUnanswered((prev) => prev.filter((id) => id !== questionId));
    }
  };

  const handleSubmitAnswers = async () => {
    const missing = questionsList.filter((q) => {
      const ans = studentAnswers[q.questionId];
      if (!ans) return true;
      if (q.questionTypeId === 3 && !ans.answerText?.trim()) return true;
      if (q.questionTypeId !== 3 && (!ans.optionIDs || ans.optionIDs.length === 0))
        return true;
      return false;
    });

    if (missing.length > 0) {
      setUnanswered(missing.map((q) => q.questionId));
      setSnack({
        open: true,
        message: "⚠️ يوجد أسئلة لم يتم الإجابة عليها!",
        severity: "warning",
      });
      return;
    }

    let totalScore = 0;
    let wrongs = [];

    questionsList.forEach((q) => {
      const studentAns = studentAnswers[q.questionId];
      let isCorrect = false;

      if (q.questionTypeId === 3) {
        isCorrect = true; // مقالي مؤجل
      } else {
        const correctOptions = q.answers
          .filter((a) => a.isCorrect)
          .map((a) => a.optionId)
          .sort();
        const studentOptions = (studentAns?.optionIDs || []).sort();
        isCorrect =
          JSON.stringify(correctOptions) === JSON.stringify(studentOptions);
      }

      if (isCorrect) {
        totalScore += q.score;
      } else {
        wrongs.push(q.questionId);
      }
    });

    const percentage = (
      (totalScore / questionsList.reduce((s, q) => s + q.score, 0)) *
      100
    ).toFixed(2);

    setResult({ score: totalScore, percentage });
    setWrongAnswers(wrongs);
    setSubmitted(true);

    try {
      const payload = {
        studentID: 1,
        answers: Object.entries(studentAnswers).map(([qId, ans]) => ({
          questionID: Number(qId),
          answerText: ans.answerText || null,
          optionIDs: ans.optionIDs?.length ? ans.optionIDs.join(",") : null,
        })),
      };
      await axiosInstance.post("/StudentAnswers/InsertBatch", payload);
      setSnack({
        open: true,
        message: "تم إرسال الإجابات وحساب الدرجات ✅",
        severity: "success",
      });
    } catch (error) {
      console.error("Error submitting answers:", error);
      setSnack({
        open: true,
        message: "تم الحساب لكن لم يتم الحفظ في السيرفر ❌",
        severity: "error",
      });
    }
  };

  return {
    filteredAndSorted,
    viewMode,
    toggleViewMode,
    searchQuery,
    setSearchQuery,
    studentAnswers,
    handleAnswerChange,
    handleSubmitAnswers,
    submitted,
    result,
    snack,
    setSnack,
    wrongAnswers,
    unanswered,
    expandedRows,
    toggleExpand,
  };
}
