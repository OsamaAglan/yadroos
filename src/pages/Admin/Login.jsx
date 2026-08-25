// src/pages/Admin/Login.jsx
import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { useNavigate, Link } from 'react-router-dom';
import { getUserFromToken } from '../../utils/auth';

const Login = () => {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [welcome, setWelcome] = useState('');
  const [loading, setLoading] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setFormVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setWelcome('');
    setLoading(true);

    try {
      const result = await axiosInstance.post('/users/login', {
        userName: userName.trim(),
        PasswordHash: password,
      });

      const { token } = result.data.data;
      localStorage.setItem('token', token);

      const user = getUserFromToken();

      setWelcome(`مرحبًا ${user?.personName || 'بك'}! يتم تحويلك الآن...`);

      setTimeout(() => {
        if (user?.roles?.includes('مدرس') && user?.roles?.includes('طالب')) {
          navigate('/choose-role');
        } else if (user?.roles?.includes('مدرس')) {
          navigate('/teacher-dashboard');
        } else if (user?.roles?.includes('طالب')) {
          navigate('/student-dashboard');
        } else {
          navigate('/not-authorized');
        }
      }, 1200);
    } catch (err) {
      console.error(err);
      const serverMsg = err.response?.data?.message || err.response?.data?.error;
      setError(serverMsg || 'بيانات تسجيل الدخول غير صحيحة أو الحساب غير مفعّل');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 p-4 relative"
      style={{
        backgroundImage: 'url("/background.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
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
            formVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'
          }`}
        >
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
            تسجيل الدخول
          </h2>

          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block mb-1 text-sm font-medium text-gray-700 text-right">
                اسم المستخدم
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                placeholder="أدخل اسم المستخدم"
              />
            </div>

            <div className="mb-4">
              <label className="block mb-1 text-sm font-medium text-gray-700 text-right">
                كلمة المرور
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                placeholder="أدخل كلمة المرور"
              />
              <label className="inline-flex items-center mt-2 text-sm text-gray-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={() => setShowPassword(!showPassword)}
                  className="mr-2 accent-blue-600 rounded"
                />
                <span className="mr-1.5">إظهار كلمة المرور</span>
              </label>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg text-center leading-relaxed">
                {error}
              </div>
            )}

            {welcome && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm font-bold rounded-lg text-center animate-pulse">
                {welcome}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-lg hover:bg-blue-700 transition shadow disabled:opacity-50"
              >
                {loading ? 'جاري التحقق...' : 'دخول'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="w-full bg-gray-100 text-gray-700 font-medium py-2.5 rounded-lg hover:bg-gray-200 transition border border-gray-300"
              >
                إلغاء
              </button>
            </div>
          </form>

          {/* روابط */}
          <div className="mt-6 text-center text-sm text-gray-700 space-y-2 border-t pt-4">
            <p>
              <Link to="/forgot-password" className="text-blue-600 hover:underline">
                نسيت كلمة المرور؟
              </Link>
            </p>
            <p>
              <Link to="/register" className="text-blue-600 hover:underline font-bold">
                مستخدم جديد؟ أنشئ حسابك الآن
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
