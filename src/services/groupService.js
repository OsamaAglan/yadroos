import axiosInstance from '../api/axiosInstance';

const BASE_URL = '/api/TeacherGroups';

export const getGroupsByTeacherID = (teacherID) =>
  axiosInstance.get(`${BASE_URL}/GetByTeacherID/${teacherID}`);

export const getAllSubjects = () =>
  axiosInstance.get('/api/TeacherSubjects/GetAll');

export const insertGroup = (data) =>
  axiosInstance.post(`${BASE_URL}/Insert`, data);

export const updateGroup = (data) =>
  axiosInstance.put(`${BASE_URL}/Update`, data);

export const deleteGroup = (id) =>
  axiosInstance.delete(`${BASE_URL}/Delete/${id}`);
