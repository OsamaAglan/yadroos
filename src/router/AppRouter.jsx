import React from "react";
import { Routes, Route, Navigate } from "react-router-dom"; // Updated imports without Router

import TeacherGroups from "../pages/Teachers/TeacherGroups";
import Dashboard from "../pages/Teachers/TeacherDashboard";
import TeacherProfilePage from "../pages/Teachers/TeacherProfilePage";
import GroupAnalytics from "../pages/Teachers/GroupAnalytics";
import QuestionsPage from "../pages/Teachers/ExercisesTab";
import TeacherGroupDetails from "../pages/Teachers/GroupDetails2";
import TeacherSettings from "../components/Teachers/TeacherSettings";

import Students from "../pages//Students/Students";
import StudentProfile from "../pages/Students/StudentProfile";
import StudentDashboard from "../pages/Students/StudentDashboard";
import MyGroups from "../pages/Students/MyGroups";
import StudentGroupDetails from "../pages/Students/StudentGroupDetails";
import NotificationsPage from "../pages/NotificationsPage";


import Subjects from "../pages/Admin/Subjects";
import Login from "../pages/Admin/Login";
import ChangePassword from "../pages/Admin/ChangePassword";
import Register from "../pages/Admin/Register";


 
import MainPage from "../pages/MainPage";

import MainLayout from "../layout/MainLayout";

const AppRouter = () => {
  return (
    <>
      <Routes>
        {/* توجيه تلقائي من الصفحة الرئيسية إلى /Login */}

        <Route path="/" element={<Navigate to="/main-page" />} />
        
{ /*<Route path="/" element={<Navigate to="/Login" />} />*/}


        {/* صفحات داخل الواجهة الرئيسية */}
      
        <Route
          path="/main-page"
          element={
            <MainLayout role="visitor">
              <MainPage />
            </MainLayout>
          }
        />

        <Route
          path="/teacher-dashboard"
          element={
            <MainLayout role="teacher">
              <Dashboard />
            </MainLayout>
          }
        />
 



  <Route
          path="/teachers-profile/:id" 
          element={
            <MainLayout role="teacher">
              <TeacherProfilePage />
            </MainLayout>
          }
        />
 
 
  <Route
          path="/notifications" 
          element={
            <MainLayout role="student">
              <NotificationsPage />
            </MainLayout>
          }
        />
 
 


        <Route
          path="/teacher-groups"
          element={
            <MainLayout role="teacher">
              <TeacherGroups />
            </MainLayout>
          }
        />


        <Route
          path="/teacher-group-details"
          element={
            <MainLayout role="teacher">
              <TeacherGroupDetails />
            </MainLayout>
          }
        />

        <Route
          path="/teacher-questions-page"
          element={
            <MainLayout role="teacher">
              <QuestionsPage />
            </MainLayout>
          }
        />

        <Route
          path="/teacher-subjects"
          element={
            <MainLayout role="teacher">
              <Subjects />
            </MainLayout>
          }
        />

        <Route
          path="/teacher-students/:id"
          element={
            <MainLayout role="teacher">
              <Students />
            </MainLayout>
          }
        />

     <Route
          path="/teacher-group-analytics"
          element={
            <MainLayout role="teacher">
              <GroupAnalytics />
            </MainLayout>
          }
        />

    <Route
          path="/teacher-settings"
          element={
            <MainLayout role="teacher">
              <TeacherSettings />
            </MainLayout>
          }
        />


        <Route
          path="/student-dashboard"
          element={
            <MainLayout role="student">
              <StudentDashboard />
            </MainLayout>
          }
        />
   
<Route path="/student-groups/:studentId/:gradeId/:term" 

element={



 <MainLayout role="student">
            <MyGroups />
            </MainLayout>

} 


/>


     



        <Route
          path="/student-group-details"
          element={
            <MainLayout role="student">
              <StudentGroupDetails />
            </MainLayout>
          }
        />



        <Route
          path="/student-profile/:id"
          element={
            <MainLayout role="student">
              <StudentProfile />
            </MainLayout>
          }
        />


 
 


   
        <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
    <Route path="/forgot-password" element={<ChangePassword />} />

      </Routes>
    </>
  );
};

export default AppRouter;
