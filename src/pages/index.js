"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Map from '../components/Map'
import SearchBar from '../components/SearchBar';
import LoaderScreen from '../components/LoaderScreen';
import Modal from '../components/Modal';
import icons from '../data/icons.json'
import houseData from '../data/houses.json'

export default function Home() {
  const router = useRouter();
  const { destination } = router.query;

  const [selectedHouse, setSelectedHouse] = useState(null);
  const [selectedPoi, setSelectedPoi] = useState(null);

  const [routeDestination, setRouteDestination] = useState(null);
  const [routeVisible, setRouteVisible] = useState(false);
  const [routeRequest, setRouteRequest] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [modalData, setModalData] = useState(null);

  const [isModalShown, setIsModalShown] = useState(false);
  const [filterCategories, setFilterCategories] = useState([]);
  const [location, setLocation] = useState(null)


  // POI has been selected by click using the map
  const poiSelectedHandler = (data) => {
    
    setSelectedPoi(data)
    setRouteDestination(data)
    
    //Signal to the map component that it should perform a routing operation
    setRouteRequest(true)    
  }

  // House has been selected using the search bar
  const searchBarSuggestionSelected = (feature) => {
    setRouteVisible(false)
    setSelectedHouse(feature)
  }

  // User pressed the X button in the search bar
  const searchBarQueryCanceled = () => {
    setRouteVisible(false)
    setSelectedHouse(null)
  }

  // User toggled a search filter
  const filtersChangeHandler = (newFilters) => {
    setFilterCategories(newFilters)
  }

  // User initiated a route planning, time to display the route layer on the map
  const onRoutingStartHandler = () => {
    setRouteVisible(true)
  }

  // Something is underway, toggle the loading screen
  const setLoading = (status) => {
    setIsLoading(status)
  }

  // Set the flag that indicates to the map if a routing is needed or not
  const routeRequestReset = () => {
    setRouteRequest(false)
  }

  // In the house popup, the Directions to here button has been pressed
  const routeDestinationSelectedHandler = (data) => {
 
    setRouteDestination(data)
    
    //Signal to the map component that it should perform a routing operation
    setRouteRequest(true)
  }

  const openModal = (modalData) => {
    setModalData(modalData)
    setIsModalShown(true)
  }

  const modalCloseHandler = () => {
    setLoading(false)
    setIsModalShown(false)
  }

  // Geolocation
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    
    setLoading(true)

    // Get current position once
    navigator.geolocation.getCurrentPosition(
      (position) => {
        let feature = {"type": "Feature", "properties": {}, "geometry": {"type": "Point", "coordinates": [position.coords.longitude, position.coords.latitude]}}   
        setLocation(feature);
        setLoading(false)
        console.log("Position GET")
      },
      (err) => setError(err.message),
      { enableHighAccuracy: true }
    );

    // Watch position for continuous updates
    const watchId = navigator.geolocation.watchPosition(
      (position) => {     
        let feature = {"type": "Feature", "properties": {}, "geometry": {"type": "Point", "coordinates": [position.coords.longitude, position.coords.latitude]}}        
        setLocation(feature);
        setLoading(false)         
        console.log("Position WATCH")
      },
      (err) => setError(err.message),
      {
        enableHighAccuracy: true,
        maximumAge: 10000
      }
    );

    // Cleanup function
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return (
    <div className="relative h-screen w-full">
      <Map
        selectedHouse={selectedHouse}
        routeShouldRun={routeRequest}
        routeVisible={routeVisible}
        filters={filterCategories}
        userLocation={location}
        routeDestination={routeDestination}
        onRoutingStart={onRoutingStartHandler}
        onRoutingFinish={routeRequestReset}
        setLoading={setLoading}        
        onRouteDestinationSelected={routeDestinationSelectedHandler}
        onPoiSelected={poiSelectedHandler}
        openModal={openModal}
      />
      <SearchBar
        destination={destination}
        onSuggestionSelected={searchBarSuggestionSelected}
        onQueryCancel={searchBarQueryCanceled}
        onFilterChange={filtersChangeHandler}
      />



      {isLoading ?
        <LoaderScreen />
        : ''
      }
      {(isModalShown && modalData !== null) ?
        <Modal messageType={modalData.type} messageText={modalData.text} buttonText={modalData.btnText} onButtonClick={modalCloseHandler}/>     
        : ''
      }
    </div>
  );

}
