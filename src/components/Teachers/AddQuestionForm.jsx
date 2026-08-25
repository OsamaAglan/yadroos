import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Checkbox,
  FormControlLabel,
  Paper,
  IconButton,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

export default function AddQuestionForm({ onSave,onCancel, groupId, termId, gradeId, initialData }) {
  const [questionText, setQuestionText] = useState("");
  const [answers, setAnswers] = useState(["", ""]);
  const [correctAnswers, setCorrectAnswers] = useState([]);
  const [score, setScore] = useState(1);
  const [questionType, setQuestionType] = useState("1"); // 1=اختياري, 2=صح/خطأ

  // 🟢 تحميل بيانات السؤال عند التعديل
  useEffect(() => {
    if (initialData) {
      setQuestionText(initialData.questionText || "");
      setQuestionType(initialData.questionTypeId?.toString() || "1");
      setAnswers(initialData.answers?.map(a => a.optionText) || ["", ""]);
      setCorrectAnswers(
        initialData.answers
          ?.map((a, i) => (a.isCorrect ? i : null))
          .filter(i => i !== null) || []
      );
      setScore(initialData.score || 1);
    } else {
      setQuestionText("");
      setAnswers(["", ""]);
      setCorrectAnswers([]);
      setScore(1);
      setQuestionType("1");
    }
  }, [initialData]);

  // 🟢 تعديل نص الإجابة
  const handleAnswerChange = (index, value) => {
    const updated = [...answers];
    updated[index] = value;
    setAnswers(updated);
  };

  // 🟢 تحديد الإجابة الصحيحة
  const handleCorrectChange = (index) => {
    if (questionType === "2") {
      // لو صح/خطأ → إجابة صحيحة واحدة فقط
      setCorrectAnswers([index]);
    } else {
      // لو اختياري → ممكن أكثر من إجابة صحيحة
      const updated = correctAnswers.includes(index)
        ? correctAnswers.filter(i => i !== index)
        : [...correctAnswers, index];
      setCorrectAnswers(updated);
    }
  };

  // 🟢 إضافة إجابة جديدة (فقط لو النوع اختياري)
  const handleAddAnswer = () => {
    if (questionType === "1") {
      setAnswers([...answers, ""]);
    }
  };

  // 🟢 حذف إجابة (فقط لو النوع اختياري)
  const handleDeleteAnswer = (index) => {
    if (answers.length <= 2) {
      alert("⚠ يجب أن يحتوي السؤال على إجابتين على الأقل");
      return;
    }
    const updatedAnswers = answers.filter((_, i) => i !== index);
    const updatedCorrect = correctAnswers
      .filter(i => i !== index)
      .map(i => (i > index ? i - 1 : i));
    setAnswers(updatedAnswers);
    setCorrectAnswers(updatedCorrect);
  };

  // 🟢 عند تغيير نوع السؤال
  const handleTypeChange = (value) => {
    setQuestionType(value);
    if (value === "2") {
      // صح/خطأ
      setAnswers(["صح", "خطأ"]);
      setCorrectAnswers([]);
    } else {
      // اختياري
      setAnswers(["", ""]);
      setCorrectAnswers([]);
    }
  };

  // 🟢 حفظ السؤال
  const handleSubmit = () => {
    const formattedAnswers = answers.map((text, i) => ({
      optionText: text,
      isCorrect: correctAnswers.includes(i),
    }));

    const payload = {
      questionText,
      questionTypeId: parseInt(questionType),
      answers: formattedAnswers,
      score,
    };
    
    onSave(payload);
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" mb={2}>
        {initialData ? "تعديل السؤال" : "إضافة سؤال جديد"}
      </Typography>

      {/* اختيار نوع السؤال */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>نوع السؤال</InputLabel>
        <Select
          value={questionType}
          onChange={(e) => handleTypeChange(e.target.value)}
        >
          <MenuItem value="1">اختياري</MenuItem>
          <MenuItem value="2">صح / خطأ</MenuItem>
        </Select>
      </FormControl>

      {/* نص السؤال */}
      <TextField
        fullWidth
        label="نص السؤال"
        value={questionText}
        onChange={(e) => setQuestionText(e.target.value)}
        sx={{ mb: 2 }}
      />

      {/* الإجابات */}
      {answers.map((ans, i) => (
        <Box key={i} sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <TextField
            fullWidth
            label={`الإجابة ${i + 1}`}
            value={ans}
            onChange={(e) => handleAnswerChange(i, e.target.value)}
            disabled={questionType === "2"} // لا يمكن تعديل النصوص في صح/خطأ
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={correctAnswers.includes(i)}
                onChange={() => handleCorrectChange(i)}
              />
            }
            label="صح"
            sx={{ ml: 1 }}
          />
          {questionType === "1" && (
            <IconButton
              color="error"
              onClick={() => handleDeleteAnswer(i)}
              disabled={answers.length <= 2}
            >
              <DeleteIcon />
            </IconButton>
          )}
        </Box>
      ))}

      {/* زر إضافة إجابة (للاختياري فقط) */}
      {questionType === "1" && (
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleAddAnswer}
          sx={{ mb: 2 }}
        >
          إضافة إجابة
        </Button>
      )}

      {/* درجة السؤال */}
      <TextField
        fullWidth
        type="number"
        label="درجة السؤال"
        value={score}
        onChange={(e) => setScore(Number(e.target.value))}
        sx={{ mb: 2 }}
      />

      <Button 
  variant="contained" 
  onClick={handleSubmit} 
  sx={{ mr: 2 }}   // مسافة يمين
>
  {initialData ? "حفظ التعديلات" : "إضافة"}
</Button>

<Button 
  variant="outlined" 
  color="error" 
  onClick={onCancel}
>
  إلغاء
</Button>


    </Paper>
  );
}
