
import React from "react";
import { FaUserCheck, FaUserClock } from "react-icons/fa";

export default function UserCard({ groupName, term, approved, notApproved, image, onEdit, onDelete,onDtls }) {
  return (
    <div className="w-full max-w-sm bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-300 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex flex-col items-center pb-6 pt-6 px-4">
        {/* 
        <img
          className="w-24 h-24 mb-3 rounded-full shadow-lg"
          src={image}
          alt={`${name} image`}
        />
        */}

      
       

 <button
            type="button"
            onClick={onDtls}
            className="text-black bg-green-300 hover:text-white hover:bg-green-700 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2 dark:bg-green-500 dark:hover:bg-green-600 dark:focus:ring-green-800 transition"
          style={{marginBottom:'5px'}}>
         <h5 className="mb-1 text-xl font-medium text-white-900 dark:text-white">
    
              {groupName}
              </h5>
          </button>

       
       
        <span className="text-sm text-gray-500 dark:text-gray-400 mb-3">{term}</span>

        {/* عدد المشتركين والمنتظرين */}
        <div className="flex justify-center gap-4 mb-4">
          <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
            <FaUserCheck />
            <span>{approved}</span>
          </div>
          <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
            <FaUserClock />
            <span>{notApproved}</span>
          </div>
        </div>

        {/* أزرار تعديل وحذف */}
        <div className="mt-2 w-full flex justify-center gap-2">
   
           <button
            type="button"
            onClick={onEdit}
            className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800 transition"
          >
            تعديل
          </button>



          <button
            type="button"
            onClick={onDelete}
            className="text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2 dark:bg-red-500 dark:hover:bg-red-600 dark:focus:ring-red-800 transition"
          >
            حذف
          </button>

        </div>
      </div>
    </div>
  );
}

