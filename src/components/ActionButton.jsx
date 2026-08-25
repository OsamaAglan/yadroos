import React from "react";

const ActionButton = ({ label, onClick, loading, color = "bg-blue-600", disabledColor = "bg-gray-400" }) => {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`py-1 px-4 rounded-lg text-white transition ${
        loading ? `${disabledColor} cursor-not-allowed` : `${color} hover:opacity-90`
      }`}
    >
      {loading ? "⏳ جاري..." : label}
    </button>
  );
};

export default ActionButton;
