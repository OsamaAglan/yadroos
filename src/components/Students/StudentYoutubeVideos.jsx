import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography, Grid, Tooltip, Skeleton, Box } from "@mui/material";
import { useSearchParams } from "react-router-dom";

const API_KEY = "AIzaSyD5oo6IYddCzxG_yqXZcVFYH9BtMWZ5cwA"; // ⚠️ يفضل تحط المفتاح في .env
const MAX_RESULTS = 50;

export default function StudentYoutubeVideos() {
  const [searchParams] = useSearchParams();
  const youtubePlayListId = searchParams.get("youtubePlayListId");

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!youtubePlayListId) return;

    const fetchVideos = async () => {
      try {
        const res = await fetch(
          `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=${MAX_RESULTS}&playlistId=${youtubePlayListId}&key=${API_KEY}`
        );
        const data = await res.json();
        setVideos(data.items || []);
      } catch (error) {
        console.error("Error fetching YouTube videos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [youtubePlayListId]);

  return (
    <Box sx={{ p: 2, backgroundColor: "#fafafa", minHeight: "100vh" }}>
      <Typography variant="h6" gutterBottom>
        فيديوهات المنصة 🎥
      </Typography>

      <Grid container spacing={2}>
        {loading
          ? Array.from({ length: 6 }).map((_, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Skeleton variant="rectangular" width="100%" height={160} />
                <Skeleton width="80%" />
                <Skeleton width="60%" />
              </Grid>
            ))
          : videos.map((video, index) => {
              const title = video.snippet.title;
              const shortTitle =
                title.length > 50 ? title.slice(0, 50) + "..." : title;
              const videoId = video.snippet.resourceId?.videoId;

              return (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card
                    sx={{
                      boxShadow: 2,
                      borderRadius: 2,
                      overflow: "hidden",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <iframe
                      width="100%"
                      height="160"
                      src={`https://www.youtube.com/embed/${videoId}`}
                      title={title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Tooltip title={title}>
                        <Typography variant="subtitle1" gutterBottom>
                          {shortTitle}
                        </Typography>
                      </Tooltip>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
      </Grid>
    </Box>
  );
}
