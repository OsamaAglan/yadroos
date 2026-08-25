import React, { useState, useEffect } from 'react';

const GroupForm = ({ onSubmit, onCancel, initialData, teacherSubjects }) => {
  const [formData, setFormData] = useState({
    teacherGroupID: 0,
    groupName: '',
    teacherID: initialData?.teacherID || 0,
    subjectID: '',
    gradeID: '',
    term: 1,
  });

  useEffect(() => {
    if (initialData) setFormData(initialData);
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded shadow bg-white">
      <div className="mb-2">
        <label>اسم المجموعة</label>
        <input name="groupName" value={formData.groupName} onChange={handleChange} className="w-full border p-2" required />
      </div>

      <div className="mb-2">
        <label>اختر المادة</label>
        <select name="subjectID" value={formData.subjectID} onChange={handleChange} className="w-full border p-2" required>
          <option value="">اختر...</option>
          {teacherSubjects.map((ts) => (
            <option key={ts.teacherSubjectId} value={ts.subjectId}>
              {ts.subjectName} - {ts.gradeName}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-2">
        <label>الترم</label>
        <select name="term" value={formData.term} onChange={handleChange} className="w-full border p-2">
          <option value={1}>الترم الأول</option>
          <option value={2}>الترم الثاني</option>
        </select>
      </div>

      <div className="flex gap-2 mt-4">
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">حفظ</button>
        <button type="button" onClick={onCancel} className="bg-gray-300 px-4 py-2 rounded">إلغاء</button>
      </div>
    </form>
  );
};

export default GroupForm;
