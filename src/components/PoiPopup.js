import React, { useState } from 'react';

const PoiPopup = ({name, poiData, onDirectionButtonPressed}) => {
  
  const initDirectionsRequest = () => {
    onDirectionButtonPressed(poiData)
  }

  return(
    <div>
      <h3 className="font-bold text-center text-gray-700">
        {name}
      </h3>
      <button className="p-2 rounded text-white w-full mt-2 text-gray-700 bg-blue-500 hover:bg-blue-700" onClick={initDirectionsRequest}>Show route here</button>
    </div>
  )

}

export default PoiPopup