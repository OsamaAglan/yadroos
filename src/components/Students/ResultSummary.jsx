// components/Students/ResultSummary.jsx
import React from "react";
import { Box, Typography } from "@mui/material";

export default function ResultSummary({ result }) {
  return (
    <Box sx={{ mt: 3, textAlign: "center" }}>
      <Typography variant="h6" sx={{ fontWeight: "bold" }}>
        نتيجتك: {result.score} درجة
      </Typography>
      <Typography
        variant="subtitle1"
        sx={{ color: result.percentage >= 50 ? "green" : "red" }}
      >
        نسبة النجاح: {result.percentage}%
      </Typography>
    </Box>
  );
}
