/**
 * يستخرج معرف فيديو يوتيوب من جميع صيغ الروابط المختلفة:
 * - Shorts: https://www.youtube.com/shorts/VIDEO_ID
 * - Watch: https://www.youtube.com/watch?v=VIDEO_ID
 * - Share/Shortened: https://youtu.be/VIDEO_ID
 * - Live: https://www.youtube.com/live/VIDEO_ID
 * - Embed: https://www.youtube.com/embed/VIDEO_ID
 * - v: https://www.youtube.com/v/VIDEO_ID
 */
export const getYouTubeVideoId = (url) => {
  if (!url || typeof url !== "string") return null;
  const trimmedUrl = url.trim();
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = trimmedUrl.match(regExp);
  return match ? match[1] : null;
};

/**
 * تحويل أي رابط يوتيوب أو فيديو أو ملف إلى صيغة قابلة للتضمين (Embed)
 */
export const getEmbedUrl = (url, lesson = {}) => {
  if (!url && !lesson?.videoId) return "";

  if (lesson?.isYoutube && lesson?.videoId) {
    return `https://www.youtube.com/embed/${lesson.videoId}`;
  }

  const rawUrl = (url || "").trim();

  // 1. فحص روابط يوتيوب بمختلف صيغها (Shorts, Watch, youtu.be, Live, etc.)
  const ytId = getYouTubeVideoId(rawUrl);
  if (ytId) {
    return `https://www.youtube.com/embed/${ytId}`;
  }

  // 2. دعم جوجل درايف
  if (rawUrl.includes("drive.google.com") && rawUrl.includes("/view")) {
    return rawUrl.replace("/view", "/preview");
  }

  // 3. دعم فيديوهات فيسبوك
  if (rawUrl.includes("facebook.com") && !rawUrl.includes("plugins/video.php")) {
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(rawUrl)}&show_text=0&width=560`;
  }

  return rawUrl;
};
