import React, { useState } from 'react';

const TreasurePopup = ({treasureData, onQrClick, onDirections}) => {
  
  const initDirectionsRequest = () => {
    onDirections({"type": "Feature", "properties": {}, "geometry": {"type": "Point", "coordinates": treasureData.lnglat}});
    //console.log(treasureData.lnglat)
  }

  return(
    <div>  
      <div className="flex flex-col gap-2 p-2 w-full">
        <button 
          className="p-2 rounded text-gray-600 text-md w-full text-gray-700 bg-[#ffdb70] hover:bg-[#fcc212]"
          onClick={onQrClick}
        >
          I'm here. Scan QR Code
        </button>  
        <button
          className="p-2 rounded text-gray-600 text-md w-full text-gray-700 bg-[#ffdb70] hover:bg-[#fcc212]" 
          onClick={initDirectionsRequest}
        >
          Show Route here
        </button>          
      </div>            
    </div>
  )

}

export default TreasurePopup;