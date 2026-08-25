import React from 'react';

const GroupList = ({ groups, onEdit, onDelete }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {groups.map((group) => (
        <div key={group.teacherGroupId} className="border p-4 rounded shadow">
          <h2 className="text-lg font-bold mb-2">{group.groupName}</h2>
          <p>المادة: {group.subjectName}</p>
          <p>الصف: {group.gradeName}</p>
          <p>الترم: {group.term}</p>
          <div className="flex gap-2 mt-2">
            <button onClick={() => onEdit(group)} className="text-blue-500">
              تعديل
            </button>
            <button onClick={() => onDelete(group.teacherGroupId)} className="text-red-500">
              حذف
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GroupList;
