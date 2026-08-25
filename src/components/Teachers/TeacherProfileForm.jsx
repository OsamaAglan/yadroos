import { useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import Cropper from "react-easy-crop";
import Modal from "react-modal";
import { TextField, Chip, Slider } from "@mui/material";

export default function TeacherProfileForm({ teacherData, onSave }) {
  const [formData, setFormData] = useState(teacherData);
  const [preview, setPreview] = useState(teacherData.profilePicture || "");
  const [file, setFile] = useState(null);
  const [saved, setSaved] = useState(false);

  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "profilePicture" && files && files[0]) {
      const file = files[0];
      setFile(file);
      setPreview(URL.createObjectURL(file));
      setCropModalOpen(true);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const onCropComplete = (_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCropSave = async () => {
    const image = await createImage(preview);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // أبعاد الاقتصاص
    const { width, height, x, y } = croppedAreaPixels;
    canvas.width = width;
    canvas.height = height;

    // رسم الصورة فقط بدون تدوير
    ctx.drawImage(image, x * -1, y * -1);

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
        uploadData.append("uploadId", 0);
        uploadData.append("teacherId", formData.teacherId);
        uploadData.append("groupId", 0);
        uploadData.append("uploadType", "profile");
        uploadData.append("filePath", "");
        uploadData.append("File", file);

        const uploadRes = await axiosInstance.post(
          "/Uploads/Insert",
          uploadData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        if (uploadRes.data?.success) {
          uploadedPath = uploadRes.data.filePath;
        }
      }

      const updatedData = { ...formData, profilePicture: uploadedPath };
      await onSave(updatedData);

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Error saving profile:", err);
    }
  };

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
        <p className="text-gray-600 text-sm mt-2">اضغط لتحميل الصورة</p>

        {saved && <Chip label="تم الحفظ ✅" color="success" className="mt-3" />}
      </div>

      {/* الحقول */}
      <div className="col-span-2 space-y-3">
        <TextField
          fullWidth
          label="الاسم"
          name="teacherName"
          value={formData.teacherName || ""}
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

        <TextField
          fullWidth
          label="ملاحظات"
          name="notes"
          multiline
          minRows={2}
          value={formData.notes || ""}
          onChange={handleChange}
        />

        <TextField
          fullWidth
          label="نبذة"
          name="bio"
          multiline
          minRows={3}
          value={formData.bio || ""}
          onChange={handleChange}
        />



      
      

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
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

          {/* التحكم */}
          <div className="mt-4 space-y-3">
            <div>
              <label className="text-sm text-gray-600">تكبير:</label>
              <Slider
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                onChange={(e, newValue) => setZoom(newValue)}
              />
            </div>
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

// 🛠️ دالة مساعدة
function createImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (err) => reject(err));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });
}
