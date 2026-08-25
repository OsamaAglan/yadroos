import axiosInstance from "../api/axiosInstance";

export const getByStudentId = (studentId, term) =>
  axiosInstance.get(`/StudentGroups/GetBystudentID/${studentId}/${term}`);

export const getByGradeId = (gradeId, term) =>
  axiosInstance.get(`/StudentGroups/GetByGradeID/${gradeId}/${term}`);

export const joinGroup = (studentId, groupId) => {
  const payload = {
    studentGroupId: 0,
    studentId,
    teacherGroupId: groupId,
    status: 0,
  };
  return axiosInstance.post(`/StudentGroups/Insert`, payload);
};

export const updateStatus = (studentGroupId, status) => {
  const payload = [{ studentGroupId, status }];
  return axiosInstance.put(`/StudentGroups/UpdateStatus`, payload);
};
