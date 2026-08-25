import React from "react";
import { Paper, Box, Typography, Divider } from "@mui/material";
import QuestionOptions from "./QuestionOptions";
import QuestionTextAnswer from "./QuestionTextAnswer";

export default function QuestionCard({
  q, idx, unanswered, wrongAnswers,
  submitted, studentAnswers, handleAnswerChange
}) {
  const correctStyle = { color: "green", fontWeight: "bold" };

  return (
    <Paper
      sx={{
        p: 2, borderRadius: "16px", backgroundColor: "#f3f9ffff",
        boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
        border: unanswered.includes(q.questionId)
          ? "2px solid red"
          : wrongAnswers.includes(q.questionId)
          ? "2px solid red"
          : ".5px solid lightgray",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
        <Typography variant="h6">{idx + 1}- {q.questionText}</Typography>
        <Box sx={{ backgroundColor: "#1565c0", color: "white", borderRadius: "50%", width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {q.score}
        </Box>
      </Box>

      <Divider sx={{ my: 1 }} />

      {q.questionTypeId === 3 ? (
        <QuestionTextAnswer
          q={q}
          submitted={submitted}
          studentAnswers={studentAnswers}
          handleAnswerChange={handleAnswerChange}
        />
      ) : (
        <QuestionOptions
          q={q}
          submitted={submitted}
          wrongAnswers={wrongAnswers}
          studentAnswers={studentAnswers}
          handleAnswerChange={handleAnswerChange}
          correctStyle={correctStyle}
        />
      )}
    </Paper>
  );
}
