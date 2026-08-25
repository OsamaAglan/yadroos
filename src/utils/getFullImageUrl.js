const API_URL = process.env.REACT_APP_API_URL;



export function getFullImageUrl(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;

  // 🔹 افترض ان الصور بتتخزن في wwwroot/uploads
  return `${process.env.REACT_APP_API_URL.replace("/api/", "/")}${path}`;
}
