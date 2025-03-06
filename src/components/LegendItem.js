import React, { useState, useEffect } from 'react';
import Image from "next/image";

const LegendItem = ({categoryId, imageURL, categoryName, isChecked, onCheckHandler}) => {

  const toggleSelection = (e) => {
    e.stopPropagation();
    onCheckHandler(categoryId)
  }

  return(
    <label
      key={categoryId}
      className={`flex flex-col items-center justify-center w-24 h-24 border-2 rounded-lg cursor-pointer shadow-md transition-all ${isChecked
      ? "bg-[#f6e7b4] text-gray-700 border-gray-300"
      : "bg-white text-gray-700 border-gray-300"
    }`}
  >
    <input
      type="checkbox"
      checked={isChecked}
      className="hidden"
      readOnly
      onChange={toggleSelection}
    />
    <Image 
      src={imageURL}
      alt={`Icon for legend item ${categoryName}`}
      width={42} 
      height={56} 
    />                  
    <span className="text-sm font-medium">{categoryName[0].toUpperCase() + categoryName.slice(1, categoryName.length)}</span>
  </label>    
  )

}

export default LegendItem