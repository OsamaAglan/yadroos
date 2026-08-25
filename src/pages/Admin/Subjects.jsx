import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [subjectName, setSubjectName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [loading, setLoading] = useState(false);

  const getSubjects = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/Subjects/GetAll');
      setSubjects(res.data.data || []);
    } catch (error) {
      console.error('فشل في جلب البيانات', error);
    }
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!subjectName.trim()) return;

    try {
      await axiosInstance.post('/Subjects/Insert', {
        subjectID: 0,
        subjectName,
      });
      setSubjectName('');
      getSubjects();
    } catch (error) {
      console.error('خطأ في الإضافة', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه المادة؟')) return;

    try {
      await axiosInstance.delete(`/Subjects/Delete/${id}`);
      getSubjects();
    } catch (error) {
      console.error('خطأ في الحذف', error);
    }
  };

  const handleEdit = (id, name) => {
    setEditingId(id);
    setEditingName(name);
  };

  const handleSave = async () => {
    if (!editingName.trim()) return;

    try {
      await axiosInstance.put('/Subjects/Update', {
        subjectID: editingId,
        subjectName: editingName,
      });
      setEditingId(null);
      setEditingName('');
      getSubjects();
    } catch (error) {
      console.error('خطأ في التعديل', error);
    }
  };

  useEffect(() => {
    getSubjects();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">📘 المواد الدراسية</h1>

      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-2">
        <input
          type="text"
          value={subjectName}
          onChange={(e) => setSubjectName(e.target.value)}
          placeholder="اسم المادة الجديدة"
          className="border p-2 rounded w-full sm:w-auto"
        />
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          ➕ إضافة
        </button>
      </div>

      {loading ? (
        <p>جارٍ التحميل...</p>
      ) : (
        <table className="w-full bg-white shadow rounded text-right">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2">#</th>
              <th className="p-2">اسم المادة</th>
              <th className="p-2">خيارات</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((subj, index) => (
              <tr key={subj.subjectID} className="border-t">
                <td className="p-2">{index + 1}</td>
                <td className="p-2">
                  {editingId === subj.subjectID ? (
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="border p-1 rounded w-full"
                    />
                  ) : (
                    subj.subjectName
                  )}
                </td>
                <td className="p-2 space-x-2 space-x-reverse">
                  {editingId === subj.subjectID ? (
                    <>
                      <button
                        onClick={handleSave}
                        className="text-green-600 hover:underline"
                      >
                        حفظ
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-gray-500 hover:underline"
                      >
                        إلغاء
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEdit(subj.subjectID, subj.subjectName)}
                        className="text-blue-600 hover:underline"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => handleDelete(subj.subjectID)}
                        className="text-red-600 hover:underline"
                      >
                        حذف
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {subjects.length === 0 && (
              <tr>
                <td colSpan="3" className="text-center p-4 text-gray-400">
                  لا توجد مواد حاليًا.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Subjects;
