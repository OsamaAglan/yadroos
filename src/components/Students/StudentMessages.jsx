// src/components/StudentMessages.jsx
import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance"; // 👈 استبدل axios

const StudentMessages = ({ studentId }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance
      .get(`/students/${studentId}/messages?unread=true`) // 👈 لاحظ شلت /api لأن baseURL فيه api
      .then((res) => setMessages(res.data))
      .finally(() => setLoading(false));
  }, [studentId]);

  const markAsRead = (id) => {
    axiosInstance
      .post(`/messages/${id}/mark-as-read`)
      .then(() => {
        setMessages((prev) => prev.filter((msg) => msg.id !== id));
      });
  };

  if (loading) return <p>📩 جارٍ تحميل الرسائل...</p>;
  if (messages.length === 0) return null;

  return (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded-lg shadow mb-6">
      <h2 className="text-lg font-bold mb-2">📩 رسائل المدرسين</h2>
      {messages.map((msg) => (
        <div
          key={msg.id}
          className="flex justify-between items-center bg-white p-3 mb-2 rounded shadow"
        >
          <div>
            <p className="font-semibold">{msg.title}</p>
            <p className="text-sm text-gray-700">{msg.body}</p>
          </div>
          <button
            onClick={() => markAsRead(msg.id)}
            className="text-sm text-blue-600 hover:underline"
          >
            تم القراءة
          </button>
        </div>
      ))}
    </div>
  );
};

export default StudentMessages;
