import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography, Grid, Tooltip, Skeleton } from "@mui/material";
import { useSearchParams } from "react-router-dom";

const API_KEY = "AIzaSyD5oo6IYddCzxG_yqXZcVFYH9BtMWZ5cwA";
const MAX_RESULTS = 200;

export default function YoutubeVideosTab() {
  const [searchParams] = useSearchParams();
  const youtubePlayListId = searchParams.get("youtubePlayListId");
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const PLAYLIST_ID = youtubePlayListId;

  useEffect(() => {
    fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=${MAX_RESULTS}&playlistId=${PLAYLIST_ID}&key=${API_KEY}`
    )
      .then((res) => res.json())
      .then((data) => {
        setVideos(data.items || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [PLAYLIST_ID]);

  return (
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
            const shortTitle = title.length > 50 ? title.slice(0, 50) + "..." : title;
            const videoId = video.snippet.resourceId.videoId;

            return (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  sx={{
                    boxShadow: 3,
                    borderRadius: 2,
                    overflow: "hidden",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <iframe
                    width="100%"
                    height="160" // ✅ صغرنا الفيديو
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
                    {video.snippet.description && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                      >
                        {video.snippet.description.slice(0, 100)}...
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
    </Grid>
  );
}
