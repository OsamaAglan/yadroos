// StudentPDFsTab.jsx
import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import {
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogContent,
  Typography,
} from "@mui/material";
import { useSearchParams } from "react-router-dom";
import { getFullImageUrl } from "../../utils/getFullImageUrl";

export default function StudentPDFsTab() {
  const [searchParams] = useSearchParams();
  const groupId = searchParams.get("groupId");

  const [files, setFiles] = useState([]);
  const [previewFile, setPreviewFile] = useState(null);

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

  // لعرض المصغرات
  const renderThumbnail = (filePath) => {
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
      {/* عرض المصغرات */}
      <Grid container spacing={2}>
        {files.map((f, index) => (
          <Grid item xs={12} sm={6} md={4} key={f.uploadId || index}>
            <Card sx={{ position: "relative", boxShadow: 3, borderRadius: 2 }}>
              <CardContent sx={{ p: 1 }}>
                {renderThumbnail(getFullImageUrl(f.filePath))}
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

      {files.length === 0 && (
        <Typography align="center" sx={{ mt: 3 }}>
          لا توجد ملفات متاحة حالياً
        </Typography>
      )}
    </div>
  );
}
