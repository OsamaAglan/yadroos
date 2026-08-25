import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import TeacherProfileForm from "../../components/Teachers/TeacherProfileForm";
import axiosInstance from "../../api/axiosInstance";

export default function TeacherProfilePage() {
  const { id } = useParams();
  const [teacherData, setTeacherData] = useState(null);
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const response = await axiosInstance.get(`/Teachers/GetByID/${id}`);
        // الـ API بيرجع data جوة object، فأخد أول عنصر
        if (response.data?.data?.length > 0) {
          setTeacherData(response.data.data[0]);
         
        }
      } catch (err) {
        console.error("Error fetching teacher data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacher();
  }, [id]);

const handleSave = async (updatedData) => {
  try {
    const response = await axiosInstance.put(`/Teachers/Update`, updatedData);
    setTeacherData(response.data);
    // ✅ تم حذف رسالة النجاح
  } catch (err) {
    console.error("Error updating teacher:", err);
    // ❌ تم حذف رسالة الخطأ
  }
};


  if (loading) return <p className="text-center mt-10">جاري التحميل...</p>;
  if (!teacherData) return <p className="text-center mt-10">لم يتم العثور على بيانات المعلم ❌</p>;

  return <TeacherProfileForm teacherData={teacherData} onSave={handleSave} />;
}
