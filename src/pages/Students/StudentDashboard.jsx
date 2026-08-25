// src/pages/StudentDashboard.jsx
import React from "react";
import StudentMessages from "../../components/Students/StudentMessages";
import StudentGroups from "../../components/Students/StudentGroups";
import RecentVideos from "../../components/Students/RecentVideos";
import LastWatchedVideo from "../../components/LastWatchedVideo";
import FileNotifications from "../../components/Admin/FileNotifications";
import { Contact } from "lucide-react";

const StudentDashboard = () => {
  const studentId = 101; // لاحقًا: اجلب من Auth context أو من التوكن

  return (
    <div className="p-6 bg-gray-100 min-h-screen space-y-6">
                    
      {
      /*

         <section>
        <StudentMessages studentId={studentId} />
      </section>
    
      
     

      <section>
        <StudentGroups studentId={studentId} />
      </section>

      <section>
        <RecentVideos studentId={studentId} />
      </section>

      <section>
        <LastWatchedVideo studentId={studentId} />
      </section>

      <section>
        <FileNotifications studentId={studentId} />
      </section>
        */
      }
      <h1>صفحة لوحة المعلومات الخاصه بالطالب</h1>
      <p>ان شاء الله بعد الانتهاء من صفحات الطالب نفعل الداش بورد</p>
    </div>
  );
};

export default StudentDashboard;
