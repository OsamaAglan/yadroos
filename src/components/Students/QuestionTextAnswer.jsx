// components/Students/QuestionTextAnswer.jsx
import React from "react";
import { TextField } from "@mui/material";

export default function QuestionTextAnswer({
  questionId,
  studentAnswers,
  submitted,
  handleAnswerChange,
}) {
  return (
    <TextField
      fullWidth
      multiline
      rows={3}
      placeholder="✏️ اكتب إجابتك هنا..."
      value={studentAnswers[questionId]?.answerText || ""}
      onChange={(e) =>
        handleAnswerChange(questionId, e.target.value, true, true)
      }
      disabled={submitted}
    />
  );
}
