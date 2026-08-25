// src/pages/Admin/ChangePassword.jsx
import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import { useNavigate, Link } from "react-router-dom";

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [formVisible, setFormVisible] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setFormVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmNewPassword) {
      setError("كلمة المرور الجديدة وتأكيد كلمة المرور غير متطابقتين");
      return;
    }

    if (newPassword.length < 4) {
      setError("كلمة المرور الجديدة يجب أن تكون 4 أحرف/أرقام على الأقل");
      return;
    }

    setLoading(true);

    try {
      const result = await axiosInstance.post("/users/change-password", {
        currentPassword,
        newPassword,
      });

      if (result.data.success) {
        setSuccess("تم تغيير كلمة المرور بنجاح! سيتم تحويلك لصفحة تسجيل الدخول...");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setError(result.data.message || "فشل تغيير كلمة المرور");
      }
    } catch (err) {
      console.error(err);
      const serverMsg = err.response?.data?.message || err.response?.data?.error;
      setError(serverMsg || "حدث خطأ أثناء تغيير كلمة المرور. حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 p-4 relative"
      style={{
        backgroundImage: 'url("/background.png")',
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

      <div className="absolute top-6 text-3xl sm:text-4xl font-extrabold text-yellow-400 drop-shadow-lg z-10 select-none">
        <Link to="/" className="flex items-center gap-1 hover:opacity-90 transition">
          <span className="text-blue-500">Ya</span>Droos
        </Link>
      </div>

      <div className="relative z-10 w-full flex justify-center mt-12 mb-6">
        <div
          className={`w-full max-w-sm sm:max-w-md bg-white/95 backdrop-blur-md p-6 sm:p-8 rounded-2xl shadow-2xl border border-white/40 transition-all duration-700 ${
            formVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"
          }`}
        >
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
            تغيير كلمة المرور
          </h2>

          <form onSubmit={handleChangePassword}>
            <div className="mb-4">
              <label className="block mb-1 text-sm font-medium text-gray-700 text-right">
                كلمة المرور الحالية
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                placeholder="أدخل كلمة المرور الحالية"
              />
            </div>

            <div className="mb-4">
              <label className="block mb-1 text-sm font-medium text-gray-700 text-right">
                كلمة المرور الجديدة
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                placeholder="أدخل كلمة المرور الجديدة"
              />
            </div>

            <div className="mb-4">
              <label className="block mb-1 text-sm font-medium text-gray-700 text-right">
                تأكيد كلمة المرور الجديدة
              </label>
              <input
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                placeholder="أعد كتابة كلمة المرور الجديدة"
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg text-center">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm font-bold rounded-lg text-center animate-pulse">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-lg hover:bg-blue-700 transition shadow disabled:opacity-50"
            >
              {loading ? "جاري الحفظ..." : "حفظ التغييرات"}
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-gray-700 border-t pt-4">
            <p>
              <Link
                to="/login"
                className="text-blue-600 hover:underline font-medium"
              >
                العودة لتسجيل الدخول
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
