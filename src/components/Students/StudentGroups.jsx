// src/components/StudentGroups.jsx
import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance"; // 👈 بدل axios

const StudentGroups = ({ studentId }) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
 const Term = 1;

  useEffect(() => {
    axiosInstance
      .get(`/StudentGroups/GetBystudentID/${studentId}/${Term}`) // 👈 شيلنا /api
      .then((res) => setGroups(res.data))
      .finally(() => setLoading(false));
  }, [studentId]);
console.log("groups => ", groups);

  if (loading) return <p>📚 جارٍ تحميل المجموعات...</p>;
  if (groups.length === 0) return <p>❗ لا توجد مجموعات.</p>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">📚 مجموعاتي</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {groups.map((group) => (
          <div
            key={group.id}
            className="bg-white p-4 rounded-lg shadow hover:shadow-md transition"
          >
            <h3 className="text-lg font-semibold">{group.name}</h3>
            <p className="text-gray-600">المدرس: {group.teacher}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentGroups;
