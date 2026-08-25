// src/components/FileNotifications.jsx
import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance"; // 👈 بدل axios

const FileNotifications = ({ studentId }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance
      .get(`/students/${studentId}/notifications/files`) // 👈 شيلنا /api
      .then((res) => setNotifications(res.data))
      .finally(() => setLoading(false));
  }, [studentId]);

  if (loading) return <p>🔔 جاري تحميل الإشعارات...</p>;
  if (notifications.length === 0) return null;

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">🔔 إشعارات الملفات</h2>
      <ul className="list-disc list-inside text-gray-700">
        {notifications.map((notif) => (
          <li key={notif.id}>{notif.text}</li>
        ))}
      </ul>
    </div>
  );
};

export default FileNotifications;
