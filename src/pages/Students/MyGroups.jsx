import React, { useEffect, useState } from "react";
import { Avatar, Chip, Snackbar, IconButton } from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import { getFullImageUrl } from "../../utils/getFullImageUrl";
import {
  getByStudentId,
  getByGradeId,
  joinGroup,
  updateStatus,
} from "../../services/studentGroups";
import { STATUS } from "../../constants/status";
import ActionButton from "../../components/ActionButton";
import { getUserFromToken } from "../../utils/auth";

const MyGroups = () => {
  const { studentId, term } = useParams();
  const [myGroups, setMyGroups] = useState([]);
  const [suggestedGroups, setSuggestedGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // { type, id }
  const [error, setError] = useState("");
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [gradeInfo, setGradeInfo] = useState({ gradeId: null, gradeName: "" });

  const user = getUserFromToken();
  const GradeID = user?.gradeId;
  const personId = user?.personId;

  const navigate = useNavigate();
  const termNum = Number(term);

  // ✅ تحميل حالة الطي من localStorage
  useEffect(() => {
    const saved = localStorage.getItem("collapsedGroups");
    if (saved) {
      setCollapsedGroups(JSON.parse(saved));
    }
  }, []);

  // ✅ حفظ حالة الطي في localStorage
  useEffect(() => {
    localStorage.setItem("collapsedGroups", JSON.stringify(collapsedGroups));
  }, [collapsedGroups]);

  // ✅ تبديل حالة الكارت
  const toggleCollapse = (groupId) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  // ✅ جلب بيانات المجموعات
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const [resMy, resGrade] = await Promise.all([
          getByStudentId(personId, termNum),
          getByGradeId(GradeID, termNum),
        ]);

        const myGroupsData = resMy.data.success ? resMy.data.data : [];
        const gradeGroupsData = resGrade.data.success ? resGrade.data.data : [];

        const myGroupIds = new Set(myGroupsData.map((g) => g.teacherGroupId));
        const suggested = gradeGroupsData.filter(
          (g) => !myGroupIds.has(g.teacherGroupId)
        );

        setMyGroups(myGroupsData);
        setSuggestedGroups(suggested);
      } catch (err) {
        console.error("❌ خطأ في جلب المجموعات:", err);
        setError("فشل تحميل المجموعات");
      } finally {
        setLoading(false);
      }
    };

    if (personId && GradeID) {
      fetchGroups();
    }
  }, [personId, GradeID, termNum]);

  // ✅ جلب بيانات الصف
  useEffect(() => {
    const fetchGrade = async () => {
      if (!personId) return;
      try {
        const res = await axios.get(
          `https://yadroosdev.com-eg.net/api/Students/GetByID/${personId}`
        );
        if (res.data.success && res.data.data.length > 0) {
          const student = res.data.data[0];
          setGradeInfo({
            gradeId: student.gradeId,
            gradeName: student.gradeName,
          });
        }
      } catch (err) {
        console.error("❌ خطأ في جلب بيانات الصف:", err);
      }
    };

    fetchGrade();
  }, [personId]);

  // ✅ الاشتراك في مجموعة
  const handleJoin = async (group) => {
    try {
      setActionLoading({ type: "join", id: group.teacherGroupId });
      const res = await joinGroup(studentId, group.teacherGroupId);

      if (res.data.success) {
        setMyGroups((prev) => [...prev, { ...group, status: STATUS.PENDING }]);
        setSuggestedGroups((prev) =>
          prev.filter((g) => g.teacherGroupId !== group.teacherGroupId)
        );
      } else setError("❌ فشل الاشتراك في المجموعة");
    } catch (err) {
      setError("حدث خطأ أثناء الاشتراك");
    } finally {
      setActionLoading(null);
    }
  };

  // ✅ تحديث حالة الاشتراك
  const handleUpdateStatus = async (group, status) => {
    try {
      setActionLoading({ type: "update", id: group.studentGroupId });
      const res = await updateStatus(group.studentGroupId, status);

      if (res.data.success) {
        setMyGroups((prev) =>
          prev.map((g) =>
            g.studentGroupId === group.studentGroupId ? { ...g, status } : g
          )
        );
      } else setError("❌ فشل تحديث الاشتراك");
    } catch (err) {
      setError("حدث خطأ أثناء تحديث الاشتراك");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading)
    return <p className="p-6 text-gray-600">⏳ جاري تحميل المجموعات...</p>;

  const renderAvatar = (name, picture) => (
    <Avatar
      src={getFullImageUrl(picture) || ""}
      alt={name}
      sx={{ width: 48, height: 48, bgcolor: "#1976d2", mr: 2 }}
    >
      {!picture && name ? name.charAt(0) : ""}
    </Avatar>
  );

  return (
    <div className="p-6 space-y-10">
      <h1 className="text-xl font-semibold text-gray-800 mb-6">
        📘 مجموعاتي{" "}
        <span className="text-blue-600">{gradeInfo.gradeName}</span> (الترم{" "}
        {termNum})
      </h1>

      {/* مجموعاتي */}
      <section>
        {myGroups.length === 0 ? (
          <p className="text-gray-500">لم تشترك في أي مجموعة حتى الآن.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myGroups.map((group) => {
              const status = group.status;
              const groupId = group.studentGroupId || group.teacherGroupId;
              const isCollapsed = collapsedGroups[groupId];

              return (
                <div
                  key={groupId}
                  className="shadow-lg rounded-2xl border-2 border-green-400 p-3 bg-green-100"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      {renderAvatar(group.teacherName, group.profilePicture)}
                      <h3 className="text-lg font-bold text-green-700 ml-2">
                        {group.groupName}
                      </h3>
                    </div>
                    <IconButton onClick={() => toggleCollapse(groupId)}>
                      {isCollapsed ? <ExpandMore /> : <ExpandLess />}
                    </IconButton>
                  </div>

                  {!isCollapsed && (
                    <>
                      <p>
                        <strong>📖 :</strong> {group.subjectName}
                      </p>
                      <p>
                        <strong>👨‍🏫 :</strong> {group.teacherName}
                      </p>

                      {status === STATUS.ACTIVE && (
                        <div className="mt-4 flex items-center justify-between">
                          <ActionButton
                            label="دخول"
                            onClick={() =>
                              navigate(
                                `/student-group-details?groupId=${group.teacherGroupId}&youtubePlayListId=${
                                  group.youtubePlayListId || ""
                                }`
                              )
                            }
                            loading={false}
                            color="bg-blue-600"
                          />
                          <ActionButton
                            label="إلغاء الاشتراك"
                            onClick={() =>
                              handleUpdateStatus(group, STATUS.CANCELLED)
                            }
                            loading={actionLoading?.id === group.studentGroupId}
                            color="bg-red-600"
                          />
                        </div>
                      )}

                      {status === STATUS.PENDING && (
                        <div className="mt-4 flex justify-between items-center">
                          <Chip
                            label="⏳ في انتظار الموافقة"
                            color="warning"
                          />
                          <ActionButton
                            label="إلغاء الاشتراك"
                            onClick={() =>
                              handleUpdateStatus(group, STATUS.CANCELLED)
                            }
                            loading={actionLoading?.id === group.studentGroupId}
                            color="bg-red-600"
                          />
                        </div>
                      )}

                      {status === STATUS.BLOCKED && (
                        <Chip
                          label="⛔ موقوف من المدرس"
                          color="error"
                          className="mt-4"
                        />
                      )}

                      {status === STATUS.CANCELLED && (
                        <div className="mt-4 flex flex-col items-center">
                          <Chip
                            label="🚫 تم إلغاء الاشتراك"
                            color="default"
                          />
                          <ActionButton
                            label="إعادة الاشتراك"
                            onClick={() =>
                              handleUpdateStatus(group, STATUS.PENDING)
                            }
                            loading={actionLoading?.id === group.studentGroupId}
                            color="bg-blue-900"
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* المجموعات المقترحة */}
      <hr className="border-t-2 border-gray-200" />
      <section>
        <h2 className="text-2xl font-bold mb-4 text-purple-700">
          ✨ مجموعات مقترحة لك (الترم {termNum})
        </h2>
        {suggestedGroups.length === 0 ? (
          <p className="text-gray-500">لا توجد مجموعات أخرى متاحة حالياً.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suggestedGroups.map((group) => {
              const groupId = group.teacherGroupId;
              const isCollapsed = collapsedGroups[groupId];

              return (
                <div
                  key={groupId}
                  className="shadow-xl rounded-2xl border-2 border-yellow-300 p-3 bg-yellow-100"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      {renderAvatar(group.teacherName, group.profilePicture)}
                      <h3 className="text-lg font-bold text-purple-700 ml-2">
                        {group.groupName}
                      </h3>
                    </div>
                    <IconButton onClick={() => toggleCollapse(groupId)}>
                      {isCollapsed ? <ExpandMore /> : <ExpandLess />}
                    </IconButton>
                  </div>

                  {!isCollapsed && (
                    <>
                      <p>
                        <strong>📖 :</strong> {group.subjectName}
                      </p>
                      <p>
                        <strong>👨‍🏫 :</strong> {group.teacherName}
                      </p>

                      <ActionButton
                        label="اشترك الآن"
                        onClick={() => handleJoin(group)}
                        loading={actionLoading?.id === group.teacherGroupId}
                        color="bg-green-600"
                      />
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Snackbar للأخطاء */}
      <Snackbar
        open={!!error}
        autoHideDuration={4000}
        onClose={() => setError("")}
        message={error}
      />
    </div>
  );
};

export default MyGroups;
