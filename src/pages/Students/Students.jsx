// src/pages/Students.jsx
import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { useParams } from "react-router-dom";

const Students = () => {
  const { id } = useParams(); // 👈 هيجيب teacherId من الرابط
  const [students, setStudents] = useState([]);
  const [pendingChanges, setPendingChanges] = useState({});
  const [loading, setLoading] = useState(false);
const [openGroups, setOpenGroups] = useState([]);

  const [activeTab, setActiveTab] = useState("approved"); // approved | pending | suspended

  // جلب بيانات الاشتراكات
  const fetchStudentGroups = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/Students/GetByTeacherID/${id}`);
      setStudents(res.data.data || []);
    } catch (error) {
      console.error("خطأ في جلب البيانات:", error);
    }
    setLoading(false);
  };

  // تغيير حالة الطالب (مؤقت فقط)
  const handleChange = (studentGroupId, changes) => {
    setPendingChanges((prev) => ({
      ...prev,
      [studentGroupId]: { ...(prev[studentGroupId] || {}), ...changes },
    }));
  };

  // زر الحفظ
 // زر الحفظ
const handleSave = async () => {
  try {
    // نحول التغييرات المعلقة (pendingChanges) إلى لستة بالشكل المطلوب
    const updates = Object.entries(pendingChanges).map(([id, changes]) => ({
      studentGroupID: parseInt(id, 10),
      status: changes.status,
    }));

    if (updates.length === 0) {
      alert("⚠️ مفيش تغييرات للحفظ");
      return;
    }

    await axiosInstance.put("/StudentGroups/UpdateStatus", updates);

    // تحديث البيانات المحلية بعد الحفظ
    const updatedStudents = students.map((s) =>
      pendingChanges[s.studentGroupId]
        ? { ...s, ...pendingChanges[s.studentGroupId] }
        : s
    );

    setStudents(updatedStudents);
    setPendingChanges({});
    alert("✅ تم حفظ التغييرات بنجاح");
  } catch (error) {
    console.error("خطأ في الحفظ:", error);
    alert("❌ حدث خطأ أثناء الحفظ");
  }
};

  useEffect(() => {
    fetchStudentGroups();
  }, [id]); // ✅ لو id اتغير (مدرس تاني) يعيد الجلب

  // تقسيم الطلاب حسب الحالة الجديدة
  const currentStudents = students.filter((s) => s.status === 1);
  const pendingStudents = students.filter((s) => s.status === 0);
  const suspendedStudents = students.filter((s) => s.status === 2);

  const tabs = [
    { key: "approved", label: `📚 الطلبة الحاليين (${currentStudents.length})` },
    { key: "pending", label: `📝 طلبات الاشتراك (${pendingStudents.length})` },
    { key: "suspended", label: `⛔ الموقوفين (${suspendedStudents.length})` },
  ];

  // تجميع حسب المجموعة
  const groupBy = (list) =>
    list.reduce((acc, item) => {
      if (!acc[item.groupName]) acc[item.groupName] = [];
      acc[item.groupName].push(item);
      return acc;
    }, {});

  const renderTable = (data, type) => {
    const grouped = groupBy(data);

    return Object.keys(grouped).map((groupName, idx) => (
      <div key={idx} className="mb-4 border rounded-lg shadow bg-white">
        <button
          className="w-full flex justify-between items-center p-4 bg-gray-100 hover:bg-gray-200 text-right font-bold"
         
       onClick={() => {
  setOpenGroups((prev) =>
    prev.includes(groupName)
      ? prev.filter((g) => g !== groupName) // شيل المجموعة من القائمة
      : [...prev, groupName]               // ضيف المجموعة للقائمة
  );
}}

>
          <span>
            {groupName} ({grouped[groupName].length})
          </span>
          <span>{openGroups === groupName ? "▲" : "▼"}</span>
        </button>

        {openGroups.includes(groupName) && (

          <div className="p-4">
            <table className="w-full bg-white rounded text-right border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2">#</th>
                  <th className="p-2">اسم الطالب</th>
                  <th className="p-2">تاريخ الاشتراك</th>
                  <th className="p-2">الحالة</th>
                  <th className="p-2">خيارات</th>
                </tr>
              </thead>
              <tbody>
                {grouped[groupName].map((s, i) => {
                  const changes = pendingChanges[s.studentGroupId] || {};
                  const final = { ...s, ...changes };

                  return (
                    <tr key={s.studentGroupId} className="border-t">
                      <td className="p-2">{i + 1}</td>
                      <td className="p-2">{s.studentName}</td>
                      <td className="p-2">
                        {new Date(s.joinDate).toLocaleString("ar-EG")}
                      </td>
                      <td className="p-2">
                        {final.status === 2 ? (
                          <span className="text-gray-600 font-bold">⛔ موقوف</span>
                        ) : final.status === 1 ? (
                          <span className="text-green-600 font-bold">✔️ موافق</span>
                        ) : (
                          <span className="text-red-600 font-bold">⏳ في الانتظار</span>
                        )}
                      </td>
                      <td className="p-2 space-x-2 space-x-reverse">
                        {type === "pending" && (
                          <>
                            <button
                              className="text-green-600 hover:underline"
                              onClick={() =>
                                handleChange(s.studentGroupId, { status: 1 })
                              }
                            >
                              ✅ موافقة
                            </button>
                            <button
                              className="text-red-600 hover:underline"
                              onClick={() =>
                                handleChange(s.studentGroupId, { status: 0 })
                              }
                            >
                              ❌ رفض
                            </button>
                          </>
                        )}
                        {type === "approved" && (
                          <button
                            className="text-orange-600 hover:underline"
                            onClick={() =>
                              handleChange(s.studentGroupId, { status: 2 })
                            }
                          >
                            ⛔ إيقاف
                          </button>
                        )}
                        {type === "suspended" && (
                          <button
                            className="text-blue-600 hover:underline"
                            onClick={() =>
                              handleChange(s.studentGroupId, { status: 1 })
                            }
                          >
                            🔄 إعادة تفعيل
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">👨‍🎓 إدارة الطلاب</h2>

      {/* التابات */}
      <div className="flex gap-4 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded ${
              activeTab === tab.key ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p>جارٍ التحميل...</p>
      ) : activeTab === "approved" ? (
        renderTable(currentStudents, "approved")
      ) : activeTab === "pending" ? (
        renderTable(pendingStudents, "pending")
      ) : (
        renderTable(suspendedStudents, "suspended")
      )}

      {/* زر الحفظ */}
      <div className="mt-6 text-center">
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          💾 حفظ
        </button>
      </div>
    </div>
  );
};

export default Students;
