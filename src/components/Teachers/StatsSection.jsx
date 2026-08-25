import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const StatsSection = ({ groups }) => {
  // الحسابات الجديدة بناءً على status
  const approved = groups.filter((g) => g.status === 1).length;
  const waiting = groups.filter((g) => g.status === 0).length;
  const suspended = groups.filter((g) => g.status === 2).length;
  const total = approved + waiting + suspended;

  // بيانات الرسم البياني
  const data = [
    { name: "مفعل", value: approved },
    { name: "منتظر", value: waiting },
    { name: "موقوف", value: suspended },
  ];

  // ألوان الرسم البياني
  const COLORS = ["#34D399", "#FBBF24", "#F87171"]; 
  // أخضر = مفعل، أصفر = منتظر، أحمر = موقوف

  return (
    <div className="bg-rose-100 p-6 rounded-xl shadow-md">
      {/* البطاقات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 text-center">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-600">إجمالي</h2>
          <p className="text-2xl font-bold text-blue-900">{total}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-600">مفعل</h2>
          <p className="text-2xl font-bold text-green-600">{approved}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-600">منتظر</h2>
          <p className="text-2xl font-bold text-yellow-600">{waiting}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-600">موقوف</h2>
          <p className="text-2xl font-bold text-red-600">{suspended}</p>
        </div>
      </div>

      {/* الرسم البياني */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label={({ name, value }) => `${name}: ${value}`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StatsSection;
