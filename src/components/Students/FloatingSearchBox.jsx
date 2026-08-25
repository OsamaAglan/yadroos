// FloatingSearchBox.jsx
import React, { useState, useEffect } from "react";
import Draggable from "react-draggable";
import { Box, TextField } from "@mui/material";

export default function FloatingSearchBox({ searchQuery, onSearchChange }) {
  const [position, setPosition] = useState(
    JSON.parse(localStorage.getItem("floatingSearchPosition")) || { x: 20, y: 80 }
  );

  const handleStop = (e, data) => {
    const pos = { x: data.x, y: data.y };
    setPosition(pos);
    localStorage.setItem("floatingSearchPosition", JSON.stringify(pos));
  };

  return (
    <Draggable position={position} onStop={handleStop}>
      <Box
        sx={{
          position: "fixed",
          zIndex: 1500,
          bgcolor: "#fff",
          border: "1px solid #1976d2",
          borderRadius: 2,
          boxShadow: 3,
          p: 1,
          width: 250,
          cursor: "move",
        }}
      >
        <TextField
          fullWidth
          size="small"
          label="🔍 بحث"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </Box>
    </Draggable>
  );
}
