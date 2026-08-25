// StudentVideosTab.jsx
import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Dialog,
  DialogContent,
  Box,
} from "@mui/material";
import { useSearchParams } from "react-router-dom";
import { getFullImageUrl } from "../../utils/getFullImageUrl";

export default function StudentVideosTab() {
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
        const vids = res.data.data.filter((f) => f.uploadType === "video");
        setFiles(vids);
      } else {
        setFiles([]);
      }
    } catch (err) {
      console.error("Error fetching files:", err);
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
      <Typography variant="h6" sx={{ mb: 2 }}>
        فيديوهات المجموعة
      </Typography>

      <Grid container spacing={2}>
        {files.map((f, index) => (
          <Grid item xs={12} sm={6} md={4} key={f.uploadId || index}>
            <Card
              sx={{
                boxShadow: 3,
                borderRadius: 2,
                cursor: "pointer",
                overflow: "hidden",
              }}
              onClick={() => setPreviewFile(f.filePath)}
            >
              <video
                src={getFullImageUrl(f.filePath)}
                style={{ width: "100%", height: 200, objectFit: "cover" }}
                muted
              />
              <CardContent>
                <Typography variant="body2" noWrap>
                  {f.fileName || "فيديو بدون اسم"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatSize(f.size)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* نافذة تشغيل الفيديو بالحجم الكامل */}
      <Dialog
        open={Boolean(previewFile)}
        onClose={() => setPreviewFile(null)}
        fullWidth
        maxWidth="lg"
      >
        <DialogContent sx={{ height: "80vh" }}>
          {previewFile && (
            <video
              src={getFullImageUrl(previewFile)}
              controls
              autoPlay
              style={{ width: "100%", height: "100%" }}
            />
          )}
        </DialogContent>
      </Dialog>

      {files.length === 0 && (
        <Typography align="center" sx={{ mt: 3 }}>
          لا توجد فيديوهات متاحة حالياً
        </Typography>
      )}
    </Box>
  );
}
