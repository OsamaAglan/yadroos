import React from "react";
import { motion } from "framer-motion";

const SelectableCard = ({ id, label, isSelected, onToggle }) => {
  return (
    <motion.div
      key={id}
      onClick={() => onToggle(id)}
      className={`cursor-pointer p-3 rounded-xl border text-center font-medium shadow-md transition-colors
        ${isSelected ? "bg-blue-500 text-white border-blue-700" : "bg-gray-100 text-gray-800 border-gray-300"}
      `}
      initial={{ scale: 1, rotate: 0, y: 0 }}
      animate={
        isSelected
          ? { scale: [1, 1.2, 1], rotate: [0, -10, 10, 0], y: [-5, 0] }
          : { scale: 1, rotate: 0, y: 0 }
      }
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      {label}
    </motion.div>
  );
};

export default SelectableCard;
