// src/pages/WatchVideo.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

const WatchVideo = () => {
  const { videoId } = useParams();
  const [video, setVideo] = useState(null);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const res = await axiosInstance.get(`/videos/${videoId}`);
        setVideo(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchVideo();
  }, [videoId]);

  if (!video) return <p>جارٍ تحميل الفيديو...</p>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-2">{video.title}</h1>
      <p className="mb-4">{video.description}</p>

      <video controls width="100%" className="mb-4">
        <source src={video.url} type="video/mp4" />
        المتصفح لا يدعم عرض الفيديو.
      </video>

      <p>نسبة الاستكمال: {video.progress || 0}%</p>
    </div>
  );
};

export default WatchVideo;
