import React from 'react';

const GroupCard = ({ groupName, teacherName }) => {
  return (
    <div className="border rounded-lg p-4 shadow hover:shadow-md transition">
      <h2 className="text-lg font-bold mb-1">{groupName}</h2>
      <p className="text-gray-600">المدرس: {teacherName}</p>
    </div>
  );
};

export default GroupCard;
