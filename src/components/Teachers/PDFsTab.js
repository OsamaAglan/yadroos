import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import {
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogContent,
  LinearProgress,
  IconButton,
  Typography,
} from "@mui/material";
import { useSearchParams } from "react-router-dom";
import { getFullImageUrl } from "../../utils/getFullImageUrl";
import DeleteIcon from "@mui/icons-material/Delete";

export default function PDFsTab() {
  const [searchParams] = useSearchParams();
  const groupId = searchParams.get("groupId");

  const [files, setFiles] = useState([]);
  const [file, setFile] = useState(null);
  const [saved, setSaved] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [progress, setProgress] = useState(0); // progress bar

  useEffect(() => {
    if (groupId) {
      fetchFiles();
    }
  }, [groupId]);

  const fetchFiles = async () => {
    try {
      const res = await axiosInstance.get(`/Uploads/GetByGroupID/${groupId}`);
      if (res.data?.success && Array.isArray(res.data.data)) {
        const docs = res.data.data.filter((f) => f.uploadType === "docs");
        setFiles(docs);
      } else {
        setFiles([]);
      }
    } catch (err) {
      console.error("Error fetching files:", err);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    try {
      setProgress(0);
      const formData = new FormData();
      formData.append("uploadId", 0);
      formData.append("teacherId", 1);
      formData.append("groupId", groupId);
      formData.append("uploadType", "docs");
      formData.append("filePath", "");
      formData.append("File", file);

      const uploadRes = await axiosInstance.post("/Uploads/Insert", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percent);
          }
        },
      });

      if (uploadRes.data?.success) {
        setSaved(true);
        setFile(null);
        fetchFiles();
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error("Error uploading file:", err);
    }
  };

  const handleDelete = async (uploadId) => {
    if (!window.confirm("هل تريد حذف الملف فعلاً؟")) return;
    try {
      const res = await axiosInstance.delete(`/Uploads/Delete/${uploadId}`);
      if (res.data?.success) {
        setFiles(files.filter((f) => f.uploadId !== uploadId));
      }
    } catch (err) {
      console.error("Error deleting file:", err);
    }
  };

  // لعرض المصغرات
  const renderThumbnail = (filePath, uploadId) => {
    const ext = filePath.split(".").pop().toLowerCase();
    if (ext === "pdf") {
      return (
        <div
          style={{
            width: "100%",
            height: "200px",
            background: "#f5f5f5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            borderRadius: "6px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          }}
          onClick={() => setPreviewFile(filePath)}
        >
          📄 PDF
        </div>
      );
    } else if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) {
      return (
        <img
          src={filePath}
          alt="Preview"
          style={{
            width: "100%",
            height: "200px",
            objectFit: "cover",
            borderRadius: "6px",
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          }}
          onClick={() => setPreviewFile(filePath)}
        />
      );
    } else {
      return (
        <div
          style={{
            width: "100%",
            height: "200px",
            background: "#ddd",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "6px",
          }}
        >
          ❌ غير مدعوم
        </div>
      );
    }
  };

  // عرض بالحجم الكامل داخل Dialog
  const renderFullPreview = (filePath) => {
    const ext = filePath.split(".").pop().toLowerCase();
    if (ext === "pdf") {
      return (
        <iframe
          src={getFullImageUrl(filePath)}
          width="100%"
          height="100%"
          style={{ border: "none" }}
          title="PDF Preview"
        />
      );
    } else if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) {
      return (
        <img
          src={getFullImageUrl(filePath)}
          alt="Full Preview"
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      );
    } else {
      return <p>لا يمكن عرض هذا النوع من الملفات</p>;
    }
  };

  return (
    <div>
      {/* رفع ملف */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="file"
          accept="application/pdf,image/*"
          onChange={handleFileChange}
        />
        <button onClick={handleUpload} disabled={!file}>
          رفع ملف
        </button>
        {saved && (
          <span style={{ marginLeft: "10px", color: "green" }}>
            تم رفع الملف ✅
          </span>
        )}

        {/* معلومات عن الملف */}
        {file && (
          <div style={{ marginTop: "10px" }}>
            <Typography variant="body2">
              <strong>اسم الملف:</strong> {file.name}
            </Typography>
            <Typography variant="body2">
              <strong>الحجم:</strong>{" "}
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </Typography>
            <Typography variant="body2">
              <strong>النوع:</strong> {file.type}
            </Typography>
          </div>
        )}

        {/* Progress bar */}
        {progress > 0 && progress < 100 && (
          <div style={{ marginTop: "10px" }}>
            <LinearProgress variant="determinate" value={progress} />
            <Typography variant="body2" align="center">
              {progress}%
            </Typography>
          </div>
        )}
      </div>

      {/* عرض المصغرات */}
      <Grid container spacing={2}>
        {files.map((f, index) => (
          <Grid item xs={12} sm={6} md={4} key={f.uploadId || index}>
            <Card sx={{ position: "relative", boxShadow: 3, borderRadius: 2 }}>
              <IconButton
                size="small"
                sx={{
                  position: "absolute",
                  top: 5,
                  right: 5,
                  background: "rgba(255,255,255,0.8)",
                }}
                onClick={() => handleDelete(f.uploadId)}
              >
                <DeleteIcon fontSize="small" color="error" />
              </IconButton>
              <CardContent sx={{ p: 1 }}>
                {renderThumbnail(getFullImageUrl(f.filePath), f.uploadId)}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* نافذة تكبير */}
      <Dialog
        open={Boolean(previewFile)}
        onClose={() => setPreviewFile(null)}
        fullWidth
        maxWidth="lg"
      >
        <DialogContent sx={{ height: "90vh" }}>
          {previewFile && renderFullPreview(previewFile)}
        </DialogContent>
      </Dialog>
    </div>
  );
}
