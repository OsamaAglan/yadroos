import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Checkbox,
  FormControlLabel,
} from "@mui/material";

export default function QuestionForm({ open, onClose, onSave, editData }) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswers, setCorrectAnswers] = useState([]);
  const [score, setScore] = useState(1);

  useEffect(() => {
    if (editData) {
      setQuestion(editData.questionText);
      setOptions(editData.options);
      setCorrectAnswers(editData.correctAnswers);
      setScore(editData.score);
    } else {
      resetForm();
    }
  }, [editData]);

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleCorrectToggle = (index) => {
    if (correctAnswers.includes(index)) {
      setCorrectAnswers(correctAnswers.filter((i) => i !== index));
    } else {
      setCorrectAnswers([...correctAnswers, index]);
    }
  };

  const resetForm = () => {
    setQuestion("");
    setOptions(["", "", "", ""]);
    setCorrectAnswers([]);
    setScore(1);
  };

  const handleSubmit = () => {
    if (!question || correctAnswers.length === 0) {
      alert("من فضلك أكمل جميع البيانات");
      return;
    }
    const payload = {
      questionText: question,
      options,
      correctAnswers,
      score,
    };
    onSave(payload);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {editData ? "✏️ تعديل السؤال" : "➕ إضافة سؤال جديد"}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              label="السؤال"
              fullWidth
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </Grid>

          {options.map((opt, i) => (
            <Grid item xs={12} sm={6} key={i}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={correctAnswers.includes(i)}
                    onChange={() => handleCorrectToggle(i)}
                  />
                }
                label={
                  <TextField
                    label={`إجابة ${i + 1}`}
                    fullWidth
                    value={opt}
                    onChange={(e) => handleOptionChange(i, e.target.value)}
                  />
                }
                sx={{ alignItems: "center", width: "100%" }}
              />
            </Grid>
          ))}

          <Grid item xs={6}>
            <TextField
              type="number"
              label="الدرجة"
              fullWidth
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          إلغاء
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          حفظ
        </Button>
      </DialogActions>
    </Dialog>
  );
}
