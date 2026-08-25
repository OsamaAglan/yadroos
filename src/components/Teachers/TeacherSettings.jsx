import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { motion } from "framer-motion";
import { getUserFromToken } from "../../utils/auth";

// 🏷️ كارت واحد (صفوف أو مواد)
const SelectionCard = ({ title, items, selectedIds, toggleSelect, emptyText, color }) => {
  const selectedItems = items.filter((it) => selectedIds.includes(it.id));
  const availableItems = items.filter((it) => !selectedIds.includes(it.id));

  return (
    <div className={`rounded-2xl shadow-md p-4 w-full md:w-1/2 ${color.bgLight}`}>
      {/* ✅ عنوان + عدادات */}
      <div className="flex items-center justify-between mb-3">
        {title && <h3 className={`text-lg font-semibold ${color.textDark}`}>{title}</h3>}

        {/* ✅ العدادات */}
        <div className="flex gap-2">
          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full shadow">
            مختارة: {selectedItems.length}
          </span>
          <span className="bg-gray-300 text-gray-700 text-xs px-2 py-1 rounded-full shadow">
            متاحة: {availableItems.length}
          </span>
        </div>
      </div>

      {/* ✅ الجزء العلوي: عناصر المدرس */}
      <div className="border-b border-gray-300 pb-4 mb-4">
        <div className="min-h-[44px] flex flex-wrap gap-2">
          {selectedItems.length === 0 && (
            <div className="text-sm text-gray-400">{emptyText || "لا توجد عناصر مختارة"}</div>
          )}
          {selectedItems.map((it) => (
            <div
              key={it.id}
              className={`${color.bgStrong} ${color.textDark} px-3 py-1 rounded-full cursor-pointer shadow-md border border-black/20 transition-all`}
              onClick={() => toggleSelect(it.id)}
            >
              {it.name}
            </div>
          ))}
        </div>
      </div>

      {/* ✅ الجزء السفلي: العناصر المتاحة */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-2">المتاحة:</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {availableItems.map((it) => (
            <div
              key={it.id}
              className={`border border-black/20 bg-white 
              w-20 h-20 flex items-center justify-center cursor-pointer text-center 
              rounded-full shadow-md hover:scale-105 active:scale-95 transition-transform duration-200`}
              onClick={() => toggleSelect(it.id)}
            >
              {it.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function TeacherSettingsCardsFixed() {
  const user = getUserFromToken();
  const teacherID = user?.personId || 0;
  const [grades, setGrades] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedGrades, setSelectedGrades] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [gradesRes, subjectsRes, tgRes, tsRes] = await Promise.all([
          axiosInstance.get("/Grades/GetAll"),
          axiosInstance.get("/Subjects/GetAll"),
          axiosInstance.get(`/TeacherGrades/GetByTeacherID/${teacherID}`),
          axiosInstance.get(`/TeacherSubjects/GetByTeacherID/${teacherID}`),
        ]);

        const gradesData = gradesRes?.data?.data || [];
        const subjectsData = subjectsRes?.data?.data || [];

        setGrades(
          gradesData.map((g) => ({ id: g.gradeId, name: g.gradeName, stageName: g.stageName }))
        );
        setSubjects(subjectsData.map((s) => ({ id: s.subjectId, name: s.subjectName })));

        setSelectedGrades((tgRes?.data?.data || []).map((x) => x.gradeId));
        setSelectedSubjects((tsRes?.data?.data || []).map((x) => x.subjectId));
      } catch (err) {
        console.error("❌ خطأ في تحميل البيانات:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [teacherID]);

  const toggleGrade = (id) =>
    setSelectedGrades((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const toggleSubject = (id) =>
    setSelectedSubjects((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const handleSave = async () => {
    try {
      await Promise.all(
        selectedGrades.map((gradeId) =>
          axiosInstance.post("/TeacherGrades/Insert", { teacherGradeID: 0, teacherID, gradeId })
        )
      );

      await Promise.all(
        selectedSubjects.map((subjectId) =>
          axiosInstance.post("/TeacherSubjects/Insert", {
            teacherSubjectID: 0,
            teacherID,
            subjectId,
            gradeId: 1,
          })
        )
      );

      alert("✅ تم الحفظ بنجاح");
    } catch (err) {
      console.error("❌ خطأ أثناء الحفظ:", err);
      alert("❌ حصل خطأ أثناء الحفظ");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header + زر الحفظ */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold bg-yellow-100 rounded-lg px-4 py-2 text-center">
          اختر الصفوف الدراسية والمواد الخاصة بك
        </h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleSave}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow-md"
        >
          حفظ البيانات
        </motion.button>
      </div>

      {loading ? (
        <div>جاري التحميل...</div>
      ) : (
        <div className="flex flex-col md:flex-row gap-6">
          <SelectionCard
            title="📚 الصفوف"
            items={grades}
            selectedIds={selectedGrades}
            toggleSelect={toggleGrade}
            emptyText="لم يتم تحديد صفوف بعد"
            color={{ bgLight: "bg-blue-50", bgStrong: "bg-blue-200", textDark: "text-blue-800" }}
          />

          <SelectionCard
            title="✏️ المواد"
            items={subjects}
            selectedIds={selectedSubjects}
            toggleSelect={toggleSubject}
            emptyText="لم يتم تحديد مواد بعد"
            color={{ bgLight: "bg-green-50", bgStrong: "bg-green-200", textDark: "text-green-800" }}
          />
        </div>
      )}
    </div>
  );
}
