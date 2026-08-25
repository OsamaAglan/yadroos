// src/components/RecentVideos.jsx
import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance"; // 👈 بدل axios
import { PlayCircle } from "lucide-react";

const RecentVideos = ({ studentId }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance
      .get(`/students/${studentId}/recent-videos`) // 👈 شيلنا /api
      .then((res) => setVideos(res.data))
      .finally(() => setLoading(false));
  }, [studentId]);

  if (loading) return <p>🎬 تحميل الفيديوهات...</p>;
  if (videos.length === 0) return null;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">🎬 فيديوهات جديدة</h2>
      <ul className="space-y-2">
        {videos.map((vid) => (
          <li key={vid.id} className="flex items-center gap-2 text-blue-700">
            <PlayCircle className="w-5 h-5" />
            <span>
              {vid.title} ({vid.group})
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentVideos;
