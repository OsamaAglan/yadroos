import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import Cropper from "react-easy-crop";
import Modal from "react-modal";
import { TextField, Chip, Slider, MenuItem, Select, InputLabel, FormControl, RadioGroup, FormControlLabel, Radio } from "@mui/material";
import { getFullImageUrl } from "../../utils/getFullImageUrl";

export default function StudentProfileForm() {
  const { id: studentId } = useParams();
  const [formData, setFormData] = useState(null);
  const [preview, setPreview] = useState("");
  const [file, setFile] = useState(null);
  const [saved, setSaved] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // للقص
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  // بيانات إضافية
  const [grades, setGrades] = useState([]);
  const [cities, setCities] = useState([]);

  // ✅ تحميل بيانات الطالب
  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/Students/GetByID/${studentId}`);

        if (res.data.success) {
          const data = Array.isArray(res.data.data) ? res.data.data[0] : res.data.data;
          setFormData(data);
          setPreview(data.profilePicture ? getFullImageUrl(data.profilePicture) : "");
        } else {
          setError("لم يتم العثور على الطالب");
        }
      } catch (err) {
        console.error("Error loading student:", err);
        setError("خطأ أثناء تحميل البيانات");
      } finally {
        setLoading(false);
      }
    };

    if (studentId) fetchStudent();
  }, [studentId]);

  // ✅ تحميل المدن والمراحل
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [gradesRes, citiesRes] = await Promise.all([
          axiosInstance.get("/Grades/GetAll"),
          axiosInstance.get("/Cities/GetAll"),
        ]);
        if (gradesRes.data.data) setGrades(gradesRes.data.data);
        if (citiesRes.data.data) setCities(citiesRes.data.data);
      } catch (err) {
        console.error("Error fetching grades/cities:", err);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profilePicture" && files?.[0]) {
      const file = files[0];
      setFile(file);
      setPreview(URL.createObjectURL(file));
      setCropModalOpen(true);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const onCropComplete = (_, croppedAreaPixels) => setCroppedAreaPixels(croppedAreaPixels);

  const handleCropSave = async () => {
    const image = await createImage(preview);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const { width, height, x, y } = croppedAreaPixels;
    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(image, -x, -y);

    canvas.toBlob((blob) => {
      const croppedFile = new File([blob], file.name, { type: file.type });
      setFile(croppedFile);
      setPreview(URL.createObjectURL(croppedFile));
      setCropModalOpen(false);
    }, file.type);
  };


  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    let uploadedPath = formData.profilePicture;

    if (file) {
      const uploadData = new FormData();
      uploadData.append("studentId", formData.studentId);
      uploadData.append("uploadType", "profile");
      uploadData.append("File", file);
      uploadData.append("uploadId", 0);
      uploadData.append("groupId", 0);
      uploadData.append("filePath", "");

      const uploadRes = await axiosInstance.post("/Uploads/Insert", uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (uploadRes.data?.success) {
        uploadedPath = uploadRes.data.filePath;
      }
    }

    // ⚡ هنا نعمل التصفية
    const {
      cityName,
      stageName,
      gradeName,
      guardianID, // لو عايز تلغيه كمان
      ...rest
    } = formData;

    const updatedData = { 
      ...rest,
      profilePicture: uploadedPath,
    };

    await axiosInstance.put("/Students/Update", updatedData);

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  } catch (err) {
    console.error("Error saving student:", err);
    alert("حدث خطأ أثناء التحديث");
  }
};


  if (loading) return <p>⏳ جاري تحميل البيانات...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!formData) return <p>⚠️ لا توجد بيانات</p>;

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-lg grid grid-cols-1 md:grid-cols-3 gap-6"
    >
      {/* الصورة */}
      <div className="flex flex-col items-center col-span-1">
        <label htmlFor="profilePicture" className="cursor-pointer relative">
          <img
            src={preview || "https://via.placeholder.com/150"}
            alt="Profile"
            className="w-40 h-40 object-cover rounded-full border-2 border-gray-300 shadow"
          />
          <input
            type="file"
            id="profilePicture"
            name="profilePicture"
            accept="image/*"
            onChange={handleChange}
            className="hidden"
          />
        </label>
        <p className="text-gray-600 text-sm mt-2">اضغط لتغيير الصورة</p>
        {saved && <Chip label="تم الحفظ ✅" color="success" className="mt-3" />}
      </div>

      {/* الحقول */}
      <div className="col-span-2 space-y-3">
        <TextField
          fullWidth
          label="الاسم"
          name="studentName"
          value={formData.studentName || ""}
          onChange={handleChange}
        />
        <TextField
          fullWidth
          label="البريد الإلكتروني"
          name="email"
          type="email"
          value={formData.email || ""}
          onChange={handleChange}
        />
        <TextField
          fullWidth
          label="رقم الهاتف"
          name="phoneNumber"
          value={formData.phoneNumber || ""}
          onChange={handleChange}
        />
        <TextField
          fullWidth
          label="العنوان"
          name="address"
          value={formData.address || ""}
          onChange={handleChange}
        />

        {/* اختيار المدينة */}
        <FormControl fullWidth>
          <InputLabel>المدينة</InputLabel>
          <Select
            name="cityId"
            value={formData.cityId || ""}
            onChange={handleChange}
          >
            {cities.map((c) => (
              <MenuItem key={c.cityId} value={c.cityId}>
                {c.cityName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* اختيار المرحلة والصف */}
        <FormControl fullWidth>
          <InputLabel>الصف الدراسي</InputLabel>
          <Select
            name="gradeId"
            value={formData.gradeId || ""}
            onChange={handleChange}
          >
            {grades.map((g) => (
              <MenuItem key={g.gradeId} value={g.gradeId}>
                {g.stageName} - {g.gradeName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* اختيار الجنس */}
        <FormControl component="fieldset">
          <RadioGroup
            row
            name="gender"
            value={formData.gender || ""}
            onChange={handleChange}
          >
            <FormControlLabel value={1} control={<Radio />} label="ذكر" />
            <FormControlLabel value={2} control={<Radio />} label="أنثى" />
          </RadioGroup>
        </FormControl>

        <TextField
          fullWidth
          label="ملاحظات"
          name="notes"
          multiline
          minRows={2}
          value={formData.notes || ""}
          onChange={handleChange}
        />

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
        >
          حفظ التعديلات
        </button>
      </div>

      {/* نافذة الاقتصاص */}
      <Modal
        isOpen={cropModalOpen}
        onRequestClose={() => setCropModalOpen(false)}
        className="flex items-center justify-center h-screen"
      >
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <div className="relative w-[300px] h-[300px]">
            <Cropper
              image={preview}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>

          <div className="mt-4 space-y-3">
            <label className="text-sm text-gray-600">تكبير:</label>
            <Slider
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              onChange={(e, newValue) => setZoom(newValue)}
            />
          </div>

          <div className="flex justify-between mt-4">
            <button
              type="button"
              onClick={() => setCropModalOpen(false)}
              className="px-4 py-2 bg-gray-400 text-white rounded"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleCropSave}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              حفظ الاقتصاص
            </button>
          </div>
        </div>
      </Modal>
    </form>
  );
}

// 🛠️ دالة مساعدة لإنشاء صورة
function createImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (err) => reject(err));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });
}
