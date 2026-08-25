import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

const StudentResultTable = ({
  questions = [],
  studentAnswers = {},
  wrongAnswers = [],
}) => {
  return (
    <TableContainer component={Paper} sx={{ mt: 3 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>السؤال</TableCell>
            <TableCell>إجابة الطالب</TableCell>
            <TableCell>الإجابة الصحيحة</TableCell>
            <TableCell>النتيجة</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {questions.map((q) => {
            const studentAns = studentAnswers[q.questionId] || {};
            const isWrong = wrongAnswers.includes(q.questionId);

            // 📝 تجهيز نص إجابة الطالب
            let studentText = "—";
            if (q.questionTypeId === 3) {
              // مقالي
              studentText = studentAns.answerText || "—";
            } else if (q.questionTypeId === 2) {
              // صح/خطأ
              const selectedId = studentAns.optionIDs?.[0];
              const selectedOption = q.answers.find(
                (a) => a.optionId === selectedId
              );
              studentText = selectedOption ? selectedOption.optionText : "—";
            } else {
              // اختيارات متعددة
              studentText =
                (studentAns.optionIDs || [])
                  .map(
                    (id) => q.answers.find((a) => a.optionId === id)?.optionText
                  )
                  .filter(Boolean)
                  .join(", ") || "—";
            }

            // ✅ تجهيز نص الإجابة الصحيحة
            let correctText = "—";
            if (q.questionTypeId === 3) {
              correctText = "إجابة مقالية (يتم تصحيحها يدوياً)";
            } else {
              correctText = q.answers
                .filter((a) => a.isCorrect)
                .map((a) => a.optionText)
                .join(", ");
            }

            return (
              <TableRow
                key={q.questionId}
                sx={{
                  backgroundColor:
                    studentText === "—"
                      ? "#f5f5f5" // بدون إجابة
                      : isWrong
                      ? "#ffebee" // خطأ
                      : "#e8f5e9", // صحيح
                }}
              >
                <TableCell>{q.questionText}</TableCell>
                <TableCell>{studentText}</TableCell>
                <TableCell>{correctText}</TableCell>
                <TableCell>
                  {studentText === "—"
                    ? "⚪️ بدون إجابة"
                    : isWrong
                    ? "❌ خطأ"
                    : "✅ صحيح"}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default StudentResultTable;
