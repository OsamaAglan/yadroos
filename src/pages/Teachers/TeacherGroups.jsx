import React, { useEffect, useState } from "react";
import UserCard from "../../components/ui/card";
import axiosInstance from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { getUserFromToken } from "../../utils/auth";

import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Snackbar,
  Alert,
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const TeacherGroups = () => {
  const [groups, setGroups] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [grades, setGrades] = useState([]);
  const [openTerm, setOpenTerm] = useState({ 1: true, 2: true });
  const [mode, setMode] = useState("add");
  const [editingGroupId, setEditingGroupId] = useState(null);

  const navigate = useNavigate();

  // الحقول
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [groupName, setGroupName] = useState("");
  const [youtubePlayListId, setYoutubePlayListId] = useState("");

  const [open, setOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const user = getUserFromToken();
  const teacherId = user.personId;

  // دوال CRUD
  const fetchGroups = async () => {
    try {
      const res = await axiosInstance.get(
        `/TeacherGroups/GetByTeacherID/${teacherId}`
      );
      if (res.data.success) {
        setGroups(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching groups", err);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await axiosInstance.get(
        `/TeacherSubjects/GetByTeacherID/${teacherId}`
      );
      if (res.data.success) setSubjects(res.data.data);
    } catch (err) {
      console.error("Error fetching subjects", err);
    }
  };

  const fetchGrades = async () => {
    try {
      const res = await axiosInstance.get(
        `/TeacherGrades/GetByTeacherID/${teacherId}`
      );
      if (res.data.success) setGrades(res.data.data);
    } catch (err) {
      console.error("Error fetching grades", err);
    }
  };

  useEffect(() => {
    fetchGroups();
    fetchSubjects();
    fetchGrades();
  }, []);

  const handleDeleteGroup = async (groupId) => {
    if (!window.confirm("هل أنت متأكد أنك تريد حذف هذه المجموعة؟")) return;

    try {
      const res = await axiosInstance.delete(
        `/TeacherGroups/Delete/${groupId}`
      );
      if (res.data.success) {
        setSnackbar({
          open: true,
          message: "تم حذف المجموعة بنجاح",
          severity: "success",
        });
        fetchGroups();
      } else {
        throw new Error("فشل الحذف");
      }
    } catch (err) {
      console.error("Error deleting group", err);
      setSnackbar({
        open: true,
        message: "حدث خطأ أثناء الحذف",
        severity: "error",
      });
    }
  };

  const resetForm = () => {
    setGroupName("");
    setSelectedSubject("");
    setSelectedGrade("");
    setSelectedTerm("");
    setYoutubePlayListId("");
    setEditingGroupId(null);
  };

  const handleSubmitGroup = async () => {
    if (!groupName || !selectedSubject || !selectedGrade || !selectedTerm) {
      setSnackbar({
        open: true,
        message: "يجب ملء جميع الحقول الأساسية",
        severity: "error",
      });
      return;
    }

    const groupPayload = {
      teacherGroupID: mode === "edit" ? editingGroupId : 0,
      groupName,
      teacherID: teacherId,
      subjectID: parseInt(selectedSubject),
      gradeID: parseInt(selectedGrade),
      term: parseInt(selectedTerm),
      youtubePlayListId,
    };

    try {
      const url =
        mode === "edit" ? "/TeacherGroups/Update" : "/TeacherGroups/Insert";

      const res = await axiosInstance[mode === "edit" ? "put" : "post"](
        url,
        groupPayload,
        { headers: { "Content-Type": "application/json-patch+json" } }
      );

      if (res.data.success) {
        setSnackbar({
          open: true,
          message: mode === "edit" ? "تم التعديل بنجاح" : "تمت الإضافة بنجاح",
          severity: "success",
        });
        fetchGroups();
        setOpen(false);
        resetForm();
      } else {
        throw new Error("فشل العملية");
      }
    } catch (err) {
      console.error("Error", err);
      setSnackbar({
        open: true,
        message: "حدث خطأ أثناء العملية",
        severity: "error",
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* قائمة المجموعات */}
      {[1, 2].map((termNumber) => {
        const count = groups.filter((g) => g.termId === termNumber).length;

        return (
          <Accordion
            key={termNumber}
            expanded={openTerm[termNumber]}
            onChange={() =>
              setOpenTerm((prev) => ({
                ...prev,
                [termNumber]: !prev[termNumber],
              }))
            }
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              {/* العنوان مع عدد المجموعات */}
              <Typography variant="h6">
                {termNumber === 1 ? "📖 الترم الأول" : "📖 الترم الثاني"} (
                {count} مجموعة)
              </Typography>

              {/* زر إضافة مجموعة في أقصى الشمال */}
              <Button
                onClick={(e) => {
                  e.stopPropagation(); // عشان ما يقفلش الـ Accordion
                  resetForm();
                  setSelectedTerm(termNumber.toString()); // نحدد الترم تلقائي
                  setMode("add");
                  setOpen(true);
                }}
                variant="contained"
                color="success"
                sx={{ marginInlineStart: "auto" }}
              >
                ➕ إضافة مجموعة
              </Button>
            </AccordionSummary>

            <AccordionDetails>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {groups
                  .filter((g) => g.termId === termNumber)
                  .map((group, idx) => (
                    <UserCard
                      key={group.teacherGroupId || idx}
                      groupName={group.groupName}
                      term={group.termId}
                      status={group.status}
                      onEdit={() => {
                        setMode("edit");
                        setEditingGroupId(group.teacherGroupId);
                        setGroupName(group.groupName || "");
                        setSelectedSubject(group.subjectID?.toString() ?? "");
                        setSelectedGrade(group.gradeID?.toString() ?? "");
                        setSelectedTerm(group.term?.toString() ?? "");
                        setYoutubePlayListId(group.youtubePlayListId || "");
                        setOpen(true);
                      }}
                      onDtls={() =>
                        navigate(
                          `/teacher-group-details?groupId=${group.teacherGroupId}&youtubePlayListId=${group.youtubePlayListId}`
                        )
                      }
                      onDelete={() => handleDeleteGroup(group.teacherGroupId)}
                    />
                  ))}
              </div>
            </AccordionDetails>
          </Accordion>
        );
      })}

      {/* Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {mode === "edit" ? "✏️ تعديل المجموعة" : "➕ إضافة مجموعة جديدة"}
        </DialogTitle>
        <DialogContent className="space-y-4 mt-2">
          <TextField
            fullWidth
            label="اسم المجموعة"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
          <TextField
            select
            fullWidth
            label="اختر المادة"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            {subjects.map((s) => (
              <MenuItem key={s.subjectId} value={s.subjectId}>
                {s.subjectName}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            fullWidth
            label="اختر الصف الدراسي"
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
          >
            {grades.map((g) => (
              <MenuItem key={g.gradeId} value={g.gradeId}>
                {g.gradeName}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            fullWidth
            label="اختر الترم"
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
          >
            <MenuItem value="1">الترم الأول</MenuItem>
            <MenuItem value="2">الترم الثاني</MenuItem>
          </TextField>

          <TextField
            fullWidth
            label="YouTube Playlist ID"
            value={youtubePlayListId}
            onChange={(e) => setYoutubePlayListId(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="secondary">
            إلغاء
          </Button>
          <Button onClick={handleSubmitGroup} variant="contained">
            {mode === "edit" ? "تحديث" : "حفظ"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </div>
  );
};

export default TeacherGroups;
