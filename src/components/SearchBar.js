"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { XCircleIcon, MapPinIcon, MapIcon } from "@heroicons/react/24/solid";
import { MapIcon as MapIconOutline } from "@heroicons/react/24/outline";
import houseData from '../data/houses.json'
import icons from '../data/icons.json'
import LegendItem from './LegendItem'

const SearchBar = ({destination, onSuggestionSelected, onQueryCancel, onFilterChange, onGeolocationRequested}) => {
  const [query, setQuery] = useState("");
  const [houses, setHouses] = useState({ name: null, feature: null })
  const [showSuggestions, setShowSuggestions] = useState(false); 
  const [showLegend, setShowLegend] = useState(false);  
  const [selectedLegendItems, setSelectedLegendItems] = useState(icons.map(icon => icon.id));
  const [selectedFeature, setSelectedFeature] = useState(null);      

  const filteredHouses = query ? houses.filter(({ name }) => name.toLowerCase().includes(query.toLowerCase())) : [];

  const legendCategoryChecked = (id) => {   
    if(selectedLegendItems.indexOf(id) > -1) {
      let newSelection = [...selectedLegendItems].filter((item) => item !== id)
      setSelectedLegendItems([...newSelection])
      onFilterChange([...newSelection])
    }
    else
    {
      setSelectedLegendItems([...selectedLegendItems, id])
      onFilterChange([...selectedLegendItems, id])
    }
  };    

  const handleSelect = (selected) => {
    setSelectedFeature(selected.feature);
    setQuery(`${selected.name} (${selected.feature.properties.type})`);
    setShowSuggestions(false);
    onSuggestionSelected(selected.feature)
  };
  
  const handleClear = () => {
    setQuery("");
    setSelectedFeature(null);
    setShowSuggestions(false);
    onQueryCancel()
  };
  
  const handleGeolocate = () =>{
    onGeolocationRequested()
  }

  const toggleLegend = () => {
    setShowLegend(!showLegend)
  }

  const hideLegend = () => {
    setShowLegend(false)
  }

  useEffect(() => {
    if(destination === null || typeof destination === 'undefined') {
      return
    }
    const filteredHouses = houses.filter(({ name }) => name.toLowerCase().includes(destination.toLowerCase()))

    if(filteredHouses.length > 0) {
      //console.log((filteredHouses[0].feature))
      setQuery(filteredHouses[0].name)
      setSelectedFeature(filteredHouses[0])
      onSuggestionSelected(filteredHouses[0].feature)
    }
  }, [destination])

  useEffect(() => {
    async function fetchHouses() {
      try {
        if (houseData) {
          const uniqueHouses = houseData.features.map((feature) => ({
            name: feature.properties.name,
            feature: feature
          }));
          setHouses(uniqueHouses);
        }
      } catch (error) {
        console.error("Failed to load houses:", error);
      }
    }
    fetchHouses();
  }, []);  

  return(
      <div className="absolute top-5 w-full md:w-1/2 lg:w-1/3 px-5">


        <div className="relative">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
            </svg>
          </div>
          <input 
            type="search" 
            id="default-search" 
            className="
              block
              w-full
              p-4
              pr-[9em]
              ps-10
              text-sm
              text-gray-600
              border
              border-white-300
              rounded-lg
              bg-white-50
              focus:ring-gray-500
              focus:border-gray-500"
            placeholder="Look up your Ranch- or Cowboy house..."
            value={query}
            onFocus={hideLegend}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
            }}
            required 
          />
          {/* Clear (X) button */}
          {query && (
            <button
              onClick={handleClear}
              className="text-gray-600
              absolute
              end-[5.5rem]
              bottom-2.5
              bg-white-700
              hover:bg-white-800
              focus:ring-4
              focus:outline-none
              focus:ring-gray-300
              font-medium
              rounded-lg
              text-sm
              pr-2
              pl-2
              pt-2
              pb-2"              
            >
              <XCircleIcon className="w-5 h-5" />
            </button>
          )}

          <button
              onClick={handleGeolocate}
              className="text-gray-600
              absolute
              end-[3.25rem]
              bottom-2.5
              bg-white-700
              hover:bg-white-800
              focus:ring-4
              focus:outline-none
              focus:ring-gray-300
              font-medium
              rounded-lg
              text-sm
              pr-2
              pl-2
              pt-2
              pb-2"              
            >

            <MapPinIcon className="w-5 h-5 text-gray-600" />              
          </button>

          <button
            onClick={toggleLegend} 
            className="text-gray-600 absolute end-[0.75rem] bottom-2.5 bg-white-700 hover:bg-white-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm pr-2
              pl-2
              pt-2
              pb-2 dark:bg-white-600 dark:hover:bg-white-700"
              title="Open legend"
              >
            {showLegend ? 
              <MapIcon className="w-5 h-5 text-gray-600" /> 
            :              
              <MapIconOutline className="w-5 h-5 text-gray-600" />
            }
            
          </button>          

        </div>                 

        <AnimatePresence>
        {showLegend && (
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -100, opacity: 0 }}
          transition={{ duration: 0.6 }}
        >            
          <div className="relative w-full bg-white border border-gray-300 rounded-md mt-1 shadow-md z-10 p-2">
            <h2 className="text-gray-600 font-bold">Legenda</h2>
            <div className="flex flex-wrap justify-center gap-8 p-4">
              {icons.map((category) => (
                <LegendItem onCheckHandler={legendCategoryChecked} key={category.id} categoryId={category.id} imageURL={category.url} categoryName={category.name} isChecked={selectedLegendItems.includes(category.id)} />
              ))}
            </div>            
          </div>
        </motion.div>        
        )}
        </AnimatePresence>


        {/* Suggestion list */}
        {showSuggestions && filteredHouses.length > 0 && (
          <ul className="relative w-full bg-white border border-gray-300 rounded-md mt-1 shadow-md z-10">
            {filteredHouses.slice(0,5).map((house, index) => (                
              <li
                key={house.name}
                className="p-3 hover:bg-gray-100 cursor-pointer text-gray-600"
                onClick={() => handleSelect(house)}
              >
                {`${house.name} (${house.feature.properties.type})`}
              </li>
            ))}
          </ul>
        )}

      </div>
  )
}

export default SearchBar