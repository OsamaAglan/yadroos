// components/Logo.jsx
import React from "react";

const Logo = ({ withText = true, size = "md" }) => {
  const textSize = size === "lg" ? "text-2xl" : size === "sm" ? "text-base" : "text-xl";
  const iconSize = size === "lg" ? "h-10 w-10" : size === "sm" ? "h-5 w-5" : "h-7 w-7";

  return (
    <div className="flex items-center gap-2">
      {/* أيقونة كتاب مفتوح */}
      <div className="bg-yellow-400 p-2 rounded-full shadow-md flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`${iconSize} text-blue-700`}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M2 4a1 1 0 011-1h6a5 5 0 015 5v11a1 1 0 01-1 1H3a1 1 0 01-1-1V4zM21 3a1 1 0 00-1 1v14a1 1 0 001 1h1V3h-1zM14 8a3 3 0 00-3-3H5v14h6a3 3 0 003-3V8z" />
        </svg>
      </div>

      {/* النص */}
      {withText && (
        <h1 className={`${textSize} font-extrabold tracking-wide`}>
          <span style={{color:"yellow"}}>
            يا درووس
          </span>
         
         
        </h1>
      )}
    </div>
  );
};

export default Logo;
