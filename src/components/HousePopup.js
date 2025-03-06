import React, { useState } from 'react';

const HousePopup = ({houseData, onDirectionPressed}) => {
  
  const initDirectionsRequest = () => {
    onDirectionPressed(houseData)
  }
  
  return(
    <div>
      <h3 className="font-bold text-center text-gray-700">
        {houseData.properties.name}
      </h3>
      <p className="text-gray-600 text-center">{houseData.properties.type}</p>
      <button className="p-2 rounded text-white w-full mt-2 text-gray-700 bg-blue-500 hover:bg-blue-700" onClick={initDirectionsRequest}>Show route here</button>
    </div>
  )
}

export default HousePopup