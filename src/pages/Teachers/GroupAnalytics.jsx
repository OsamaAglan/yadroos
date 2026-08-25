import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance"; // بدل axios العادي
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

const colors = ['#f4b400', '#3366cc', '#dc3912', '#109618', '#990099'];

export default function GroupAnalytics() {
  const [data, setData] = useState([]);
  const [flatData, setFlatData] = useState([]);

  useEffect(() => {
    axiosInstance.get("/Teachers/GetGroupGrowth/1")
      .then(res => {
        setData(res.data.data);
      })
      .catch(err => {
        console.error("Error fetching group growth:", err);
      });
  }, []);

  useEffect(() => {
    // تحويل البيانات إلى شكل مناسب للرسم
    const flattened = data.flatMap(group =>
      group.data.map(entry => ({
        date: entry.joinDate,
        count: entry.studentsCount,
        group: group.groupName
      }))
    );
    setFlatData(flattened);
  }, [data]);

  const groups = [...new Set(flatData.map(item => item.group))];

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "30px" }}>
        تحليل تطور عدد الطلاب في المجموعات
      </h2>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          {groups.map((group, index) => (
            <Line
              key={group}
              data={flatData.filter(item => item.group === group)}
              type="monotone"
              dataKey="count"
              name={group}
              stroke={colors[index % colors.length]}
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
