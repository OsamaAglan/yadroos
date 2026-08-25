// src/pages/StudentMessages.jsx
import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';

const StudentMessages = () => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axiosInstance.get('/messages/archived');
        setMessages(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchMessages();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">الرسائل القديمة</h1>
      <ul className="space-y-4">
        {messages.map((msg) => (
          <li key={msg.id} className="border p-4 rounded shadow-sm bg-white">
            <h2 className="text-lg font-semibold">{msg.title}</h2>
            <p className="text-sm text-gray-500 mb-2">بتاريخ: {new Date(msg.date).toLocaleDateString()}</p>
            <p>{msg.content}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StudentMessages;
