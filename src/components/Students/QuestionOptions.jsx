// components/Students/QuestionOptions.jsx
import React from "react";
import {
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  Box,
} from "@mui/material";



export default function QuestionOptions({
  q,
  studentAnswers,
  submitted,
  wrongAnswers,
  handleAnswerChange,
  correctStyle,
}) {
  if (!q) return null;

  if (q.questionTypeId === 2) {
    return (
      <RadioGroup
        value={String(studentAnswers[q.questionId]?.optionIDs?.[0] ?? "")}
        onChange={(e) =>
          handleAnswerChange(q.questionId, Number(e.target.value), true)
        }
      >
        {q.answers?.map((ans, i) => {
          const isWrong =
            wrongAnswers.includes(q.questionId) &&
            studentAnswers[q.questionId]?.optionIDs?.includes(ans.optionId);
          return (
            <FormControlLabel
              key={ans.optionId}
              value={String(ans.optionId)}
              control={<Radio disabled={submitted} />}
              label={`${i + 1}- ${ans.optionText}`}
              sx={{
                ...(submitted
                  ? ans.isCorrect
                    ? correctStyle
                    : isWrong
                    ? { color: "red", fontWeight: "bold" }
                    : { opacity: 0.4 }
                  : {}),
              }}
            />
          );
        })}
      </RadioGroup>
    );
  }

  // ✅ اختيار متعدد
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {q.answers?.map((ans, i) => {
        const isWrong =
          wrongAnswers.includes(q.questionId) &&
          studentAnswers[q.questionId]?.optionIDs?.includes(ans.optionId);
        return (
          <FormControlLabel
            key={ans.optionId}
            control={
              <Checkbox
                checked={
                  (studentAnswers[q.questionId]?.optionIDs || []).includes(
                    Number(ans.optionId)
                  ) || false
                }
                onChange={(e) =>
                  handleAnswerChange(
                    q.questionId,
                    Number(ans.optionId),
                    e.target.checked
                  )
                }
                disabled={submitted}
              />
            }
            label={`${i + 1}- ${ans.optionText}`}
            sx={{
              ...(submitted
                ? ans.isCorrect
                  ? correctStyle
                  : isWrong
                  ? { color: "red", fontWeight: "bold" }
                  : { opacity: 0.4 }
                : {}),
            }}
          />
        );
      })}
    </Box>
  );
}
