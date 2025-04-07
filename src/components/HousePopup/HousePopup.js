import React, { useState } from 'react';
import Image from 'next/image';

const HousePopup = ({houseData, onDirectionPressed}) => {
  
  const initDirectionsRequest = () => {
    onDirectionPressed(houseData)
  }
  
  return(
    <div>  
      <Image 
        src={houseData.properties.type === 'ranch house' ? '/images/poi/ranchhouse.png': '/images/poi/cowboyhouse.png'} 
        alt={`${houseData.properties.type} in PonyPark City`} 
        width={450}
        height={270}
      />
      <div class="flex p-2 w-full">
        <div class="w-1/2 flex items-center">
          <span class="text-gray-600 font-semibold text-md">{houseData.properties.name} ({houseData.properties.type})</span>
        </div>
        <div class="w-1/2 text-end">
          <button className="p-1 rounded text-gray-600 text-md w-full text-gray-700 bg-[#ffdb70] hover:bg-[#fcc212]" onClick={initDirectionsRequest}>Show Route here</button>  
        </div>
      </div>            
    </div>    
  )
}

export default HousePopup