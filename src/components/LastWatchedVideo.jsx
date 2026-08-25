// src/components/LastWatchedVideo.jsx
import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance"; // 👈 بدل axios

const LastWatchedVideo = ({ studentId }) => {
  const [lastVideo, setLastVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance
      .get(`/students/${studentId}/last-watched`) // 👈 شيلنا /api
      .then((res) => setLastVideo(res.data))
      .finally(() => setLoading(false));
  }, [studentId]);

  if (loading) return <p>⏱️ جاري تحميل آخر فيديو...</p>;
  if (!lastVideo) return null;

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">⏱️ متابعتك الأخيرة</h2>
      <div className="bg-white p-4 rounded-lg shadow">
        <p><strong>الفيديو:</strong> {lastVideo.videoTitle}</p>
        <p><strong>المجموعة:</strong> {lastVideo.group}</p>
        <div className="w-full bg-gray-200 h-4 rounded mt-2">
          <div
            className="bg-green-500 h-4 rounded"
            style={{ width: `${lastVideo.progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default LastWatchedVideo;
