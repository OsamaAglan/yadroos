// utils/auth.js
 
import { jwtDecode } from 'jwt-decode'; // ✅ صحيح


export const getUserFromToken = () => {
  const token = localStorage.getItem('token'); // أو sessionStorage
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
   
    return {
      personId: decoded.personId,
     personName: decoded.personName,
    role: decoded.role,
      userId: decoded.userId,
        avatar: decoded.avatar,
      userName: decoded.sub,
      roles: decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"],
      exp: decoded.exp,
      gradeId:decoded.GradeID
    };


  } catch (error) {
    console.error('Invalid token:', error);
    return null;
  }
};
