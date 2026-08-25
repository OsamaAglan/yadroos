import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Dialog,
  DialogContent,
  Button,
  LinearProgress,
  Checkbox,
  FormControlLabel,
  Box,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useSearchParams } from "react-router-dom";
import { getFullImageUrl } from "../../utils/getFullImageUrl";

export default function YaDroosVideosTab() {
  const [searchParams] = useSearchParams();
  const groupId = searchParams.get("groupId");

  const [files, setFiles] = useState([]);
  const [previewFile, setPreviewFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadStats, setUploadStats] = useState({
    startTime: null,
    elapsed: 0,
    speed: 0,
    remaining: 0,
  });
  const [controller, setController] = useState(null); // ⬅️ نحتفظ بالـ AbortController

  useEffect(() => {
    if (groupId) {
      fetchFiles();
    }
  }, [groupId]);

  const fetchFiles = async () => {
    try {
      const res = await axiosInstance.get(`/Uploads/GetByGroupID/${groupId}`);
      if (res.data?.success && Array.isArray(res.data.data)) {
        const vids = res.data.data.filter((f) => f.uploadType === "video");
        setFiles(vids);
      }
    } catch (err) {
      console.error("Error fetching files:", err);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || seconds < 0) return "00:00:00";
    const h = Math.floor(seconds / 3600).toString().padStart(2, "0");
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
    const s = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  // ✅ رفع الفيديو
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("groupId", groupId);
    formData.append("uploadType", "video");
    formData.append("isPublic", true);
    formData.append("teacherId", 1);
    formData.append("filePath", "");

    const abortCtrl = new AbortController(); // ⬅️ نعمل controller جديد
    setController(abortCtrl);

    try {
      setUploading(true);
      setProgress(0);
      const startTime = Date.now();

      const res = await axiosInstance.post("/Uploads/Insert", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        signal: abortCtrl.signal, // ⬅️ نربطه هنا
        onUploadProgress: (event) => {
          if (event.total) {
            const percent = Math.round((event.loaded * 100) / event.total);
            setProgress(percent);

            const elapsedSec = (Date.now() - startTime) / 1000;
            const speed = event.loaded / elapsedSec;
            const remainingSec = (event.total - event.loaded) / (speed || 1);

            setUploadStats({
              startTime,
              elapsed: elapsedSec,
              speed,
              remaining: remainingSec,
            });
          }
        },
      });

      if (res.data?.success) {
        await fetchFiles();
      }
    } catch (err) {
      if (err.name === "CanceledError" || err.name === "AbortError") {
        console.warn("✅ تم إلغاء الرفع");
      } else {
        console.error("Error uploading file:", err);
        alert("حدث خطأ أثناء الرفع");
      }
    } finally {
      setUploading(false);
      setController(null);
    }
  };

  // ✅ إلغاء الرفع
  const handleCancelUpload = () => {
    if (controller) {
      controller.abort();
      setUploading(false);
      setProgress(0);
      setUploadStats({ startTime: null, elapsed: 0, speed: 0, remaining: 0 });
    }
  };

  // ✅ حذف الفيديو
  const handleDelete = async (uploadId) => {
    if (!window.confirm("هل تريد حذف هذا الفيديو نهائياً؟")) return;
    try {
      const res = await axiosInstance.delete(`/Uploads/Delete/${uploadId}`);
      if (res.data?.success) {
        await fetchFiles();
      }
    } catch (err) {
      console.error("Error deleting file:", err);
      alert("حدث خطأ أثناء الحذف");
    }
  };

  const toggleIsPublic = async (file) => {
    try {
      await axiosInstance.put(`/Uploads/Update/${file.uploadId}`, {
        ...file,
        isPublic: !file.isPublic,
      });
      await fetchFiles();
    } catch (err) {
      console.error("Error updating file:", err);
      alert("تعذر تحديث حالة العرض");
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    let i = 0;
    while (bytes >= 1024 && i < units.length - 1) {
      bytes /= 1024;
      i++;
    }
    return `${bytes.toFixed(1)} ${units[i]}`;
  };

  return (
    <Box sx={{ p: 2, backgroundColor: "#f9f9f9", minHeight: "100vh" }}>
      {/* ✅ زر رفع الفيديو */}
      <Box sx={{ mb: 3, display: "flex", justifyContent: "flex-start", gap: 2 }}>
        <Button
          variant="contained"
          component="label"
          startIcon={<CloudUploadIcon />}
          disabled={uploading}
          sx={{ borderRadius: 2, px: 3, py: 1 }}
        >
          رفع فيديو
          <input type="file" accept="video/*" hidden onChange={handleUpload} />
        </Button>

        {uploading && (
          <Button
            variant="outlined"
            color="error"
            onClick={handleCancelUpload}
            sx={{ borderRadius: 2, px: 3, py: 1 }}
          >
            إلغاء الرفع
          </Button>
        )}
      </Box>

      {/* ✅ شريط حالة الرفع + تفاصيل */}
      {uploading && (
        <Box sx={{ mb: 3 }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{ height: 8, borderRadius: 5, mb: 1 }}
          />
          <Typography variant="body2" color="text.secondary">
            السرعة: {(uploadStats.speed / 1024 / 1024).toFixed(2)} ميجا بايت/ثانيه
          </Typography>
          <Typography variant="body2" color="text.secondary">
            الوقت المنقضي: {formatTime(uploadStats.elapsed)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            الوقت المتبقي: {formatTime(uploadStats.remaining)}
          </Typography>
        </Box>
      )}

      {/* باقي الكود لعرض الفيديوهات + الحذف */}
      {/* ... */}
    </Box>
  );
}
