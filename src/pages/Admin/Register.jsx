// src/pages/Admin/Register.jsx
import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import { useNavigate, Link } from "react-router-dom";

const WHATSAPP_NUMBER = "01220565938";
const WHATSAPP_INT_NUMBER = "201220565938";

const Register = () => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [roleId, setRoleId] = useState(2); // 1 = مدرس , 2 = طالب , 3 = ولي أمر
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [formVisible, setFormVisible] = useState(false);

  // حالة نجاح التسجيل وحفظ بيانات المستخدم لعرض بطاقة الترحيب والانتظار
  const [registeredInfo, setRegisteredInfo] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setFormVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const getRoleName = (id) => {
    switch (Number(id)) {
      case 1:
        return "مدرس";
      case 3:
        return "ولي أمر";
      case 2:
      default:
        return "طالب";
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("كلمة المرور وتأكيد كلمة المرور غير متطابقتين");
      return;
    }

    if (password.length < 4) {
      setError("كلمة المرور يجب أن تكون 4 أحرف/أرقام على الأقل");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        userID: 0,
        userName: userName.trim(),
        passwordHash: password,
        roleId: Number(roleId),
      };

      const result = await axiosInstance.post("/Users/Insert", payload);

      if (result.data.success) {
        setRegisteredInfo({
          userName: userName.trim(),
          roleName: getRoleName(roleId),
        });
      } else {
        setError(result.data.message || "حدث خطأ أثناء التسجيل. يرجى المحاولة مرة أخرى.");
      }
    } catch (err) {
      console.error("خطأ في التسجيل:", err);
      const serverMsg = err.response?.data?.message || err.response?.data?.error;
      setError(serverMsg || "فشل إنشاء الحساب. تأكد من صحة البيانات أو حاول لاحقاً.");
    } finally {
      setLoading(false);
    }
  };

  const whatsappMessage = registeredInfo
    ? encodeURIComponent(
        `السلام عليكم ورحمة الله وبركاته،\nقمت بإنشاء حساب جديد على منصة يادُروس:\n- اسم المستخدم: ${registeredInfo.userName}\n- نوع الحساب: ${registeredInfo.roleName}\nأرجو من الإدارة التكرم بتفعيل الحساب. شكراً لكم.`
      )
    : "";

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 p-4 relative"
      style={{
        backgroundImage: 'url("/background.png")',
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* طبقة حماية للشفافية والخلفية */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

      {/* الشعار في الأعلى */}
      <div className="absolute top-6 text-3xl sm:text-4xl font-extrabold text-yellow-400 drop-shadow-lg z-10 select-none">
        <Link to="/" className="flex items-center gap-1 hover:opacity-90 transition">
          <span className="text-blue-500">Ya</span>Droos
        </Link>
      </div>

      <div className="relative z-10 w-full flex justify-center mt-12 mb-6">
        {/* ===================== شاشة الترحيب والانتظار بعد نجاح التسجيل ===================== */}
        {registeredInfo ? (
          <div
            className={`w-full max-w-md bg-white/95 backdrop-blur-md p-6 sm:p-8 rounded-2xl shadow-2xl border border-white/40 transition-all duration-700 ${
              formVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          >
            {/* أيقونة الاحتفال والترحيب */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner ring-4 ring-green-50 animate-bounce">
                <span className="text-3xl">🎉</span>
              </div>
              <h2 className="text-2xl font-extrabold text-gray-800">
                مرحباً بك في منصة <span className="text-blue-600">Ya</span>
                <span className="text-yellow-500">Droos</span>!
              </h2>
              <p className="text-gray-600 text-sm mt-1.5 font-medium">
                تم إنشاء حسابك بنجاح باسم:{" "}
                <span className="text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                  {registeredInfo.userName}
                </span>{" "}
                ({registeredInfo.roleName})
              </p>
            </div>

            {/* بطاقة تنبيه التفعيل والانتظار */}
            <div className="bg-amber-50/90 border border-amber-300 rounded-xl p-4 mb-5 text-right shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">⏳</span>
                <h3 className="font-bold text-amber-900 text-base">
                  الحساب بانتظار التفعيل من قِبل الإدارة
                </h3>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">
                انتظر حتى يتم تفعيل حسابك من قبل الإدارة لتتمكن من استخدام كافة صلاحيات المنصة بحسب دورك، أو يمكنك إرسال رسالة واتساب لتسريع عملية التفعيل فوراً.
              </p>
            </div>

            {/* زر الواتساب المباشر */}
            <div className="mb-6">
              <a
                href={`https://wa.me/${WHATSAPP_INT_NUMBER}?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 text-center group"
              >
                <svg
                  className="w-6 h-6 fill-current transition-transform group-hover:scale-110"
                  viewBox="0 0 24 24"
                >
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
                <div className="flex flex-col text-right">
                  <span className="text-sm font-bold">تواصل عبر واتساب للتفعيل</span>
                  <span className="text-xs font-normal opacity-90 tracking-wide font-mono">
                    {WHATSAPP_NUMBER}
                  </span>
                </div>
              </a>
            </div>

            {/* روابط التنقل */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl shadow transition text-center"
              >
                تسجيل الدخول
              </button>
              <button
                type="button"
                onClick={() => navigate("/")}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 rounded-xl transition border border-gray-300 text-center"
              >
                الصفحة الرئيسية
              </button>
            </div>
          </div>
        ) : (
          /* ===================== نموذج إنشاء الحساب الجديد ===================== */
          <div
            className={`w-full max-w-sm sm:max-w-md bg-white/90 backdrop-blur-md p-6 sm:p-8 rounded-2xl shadow-2xl border border-white/40 transition-all duration-700 ${
              formVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"
            }`}
          >
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
              إنشاء حساب جديد
            </h2>

            <form onSubmit={handleRegister}>
              <div className="mb-4">
                <label className="block mb-1 text-sm font-medium text-gray-700 text-right">
                  اسم المستخدم
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                  placeholder="أدخل اسم المستخدم"
                />
              </div>

              <div className="mb-4">
                <label className="block mb-1 text-sm font-medium text-gray-700 text-right">
                  كلمة المرور
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                  placeholder="كلمة المرور"
                />
              </div>

              <div className="mb-4">
                <label className="block mb-1 text-sm font-medium text-gray-700 text-right">
                  تأكيد كلمة المرور
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                  placeholder="أعد كتابة كلمة المرور"
                />
              </div>

              {/* اختيار الدور (مدرس / طالب / ولي أمر) */}
              <div className="mb-5">
                <label className="block mb-2 text-sm font-medium text-gray-700 text-right">
                  نوع الحساب
                </label>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <label
                    className={`flex items-center justify-center p-2.5 rounded-lg border cursor-pointer transition ${
                      roleId === 1
                        ? "border-blue-600 bg-blue-50 text-blue-700 font-bold shadow-sm"
                        : "border-gray-300 bg-white/70 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={1}
                      checked={roleId === 1}
                      onChange={() => setRoleId(1)}
                      className="hidden"
                    />
                    <span>مدرس</span>
                  </label>

                  <label
                    className={`flex items-center justify-center p-2.5 rounded-lg border cursor-pointer transition ${
                      roleId === 2
                        ? "border-blue-600 bg-blue-50 text-blue-700 font-bold shadow-sm"
                        : "border-gray-300 bg-white/70 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={2}
                      checked={roleId === 2}
                      onChange={() => setRoleId(2)}
                      className="hidden"
                    />
                    <span>طالب</span>
                  </label>

                  <label
                    className={`flex items-center justify-center p-2.5 rounded-lg border cursor-pointer transition ${
                      roleId === 3
                        ? "border-blue-600 bg-blue-50 text-blue-700 font-bold shadow-sm"
                        : "border-gray-300 bg-white/70 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={3}
                      checked={roleId === 3}
                      onChange={() => setRoleId(3)}
                      className="hidden"
                    />
                    <span>ولي أمر</span>
                  </label>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-2.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-lg hover:bg-blue-700 transition shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? "جاري إنشاء الحساب..." : "تسجيل"}
              </button>
            </form>

            <div className="mt-5 text-center text-sm text-gray-700">
              <p>
                لديك حساب بالفعل؟{" "}
                <Link
                  to="/login"
                  className="text-blue-600 hover:underline font-bold"
                >
                  تسجيل الدخول
                </Link>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;
