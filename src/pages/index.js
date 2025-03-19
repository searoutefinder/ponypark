"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
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
  const [geolocateRequest, setGeolocateRequest] = useState(false);
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
    console.log('cancel')
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

  // User clicks on the map ping in the searchbar to position himself on the map
  const geolocateUser = () => {
    if (!navigator.geolocation) {
      setModalData({type: 'Warning', text: `Geolocation is not supported by your browser.`, btnText: 'OK'})
      setIsModalShown(true)
      setLoading(false)
      return;
    }

    setLoading(true)

    // Get current position once
    navigator.geolocation.getCurrentPosition(
      (position) => {
        let feature = {"type": "Feature", "properties": {}, "geometry": {"type": "Point", "coordinates": [position.coords.longitude, position.coords.latitude]}}   
        setLocation(feature);
        setGeolocateRequest(true);
        setLoading(false)
        console.log("Position GET")
      },
      (error) => {
        switch (error.code) {
          case 1:
            setModalData({type: 'Warning', text: 'Permission denied. Please enable location access in your browser settings.', btnText: 'OK'})
            setIsModalShown(true)
            break;
          case 2:
            setModalData({type: 'Warning', text: 'Location information is unavailable.', btnText: 'OK'})
            setIsModalShown(true)
            break;
          case 3:
            setModalData({type: 'Warning', text: 'The request to get location timed out.', btnText: 'OK'})
            setIsModalShown(true)
            break;
          default:
            setModalData({type: 'Warning', text: 'An unknown error occurred.', btnText: 'OK'})
            setIsModalShown(true)
        }
      },
      { enableHighAccuracy: true, maximumAge: 10000 }
    );        
  }

  // Set the flag that indicates to the map if a routing is needed or not
  const geolocateRequestReset = () => {
    setGeolocateRequest(false)
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
  /*useEffect(() => {
    if (!navigator.geolocation) {
      setModalData({type: 'Warning', text: `Geolocation is not supported by your browser.`, btnText: 'OK'})
      setIsModalShown(true)
      setLoading(false)
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
      (error) => {
        switch (error.code) {
          case 1:
            setModalData({type: 'Warning', text: 'Permission denied. Please enable location access in your browser settings.', btnText: 'OK'})
            setIsModalShown(true)
            break;
          case 2:
            setModalData({type: 'Warning', text: 'Location information is unavailable.', btnText: 'OK'})
            setIsModalShown(true)
            break;
          case 3:
            setModalData({type: 'Warning', text: 'The request to get location timed out.', btnText: 'OK'})
            setIsModalShown(true)
            break;
          default:
            setModalData({type: 'Warning', text: 'An unknown error occurred.', btnText: 'OK'})
            setIsModalShown(true)
        }
      },
      { enableHighAccuracy: true, maximumAge: 10000 }
    );

    // Watch position for continuous updates
    const watchId = navigator.geolocation.watchPosition(
      (position) => {     
        let feature = {"type": "Feature", "properties": {}, "geometry": {"type": "Point", "coordinates": [position.coords.longitude, position.coords.latitude]}}        
        setLocation(feature);
        setLoading(false)         
        console.log("Position WATCH")
      },
      (error) => {
        switch (true) {
          case error.code === 1:
            setModalData({type: 'Warning', text: 'Permission denied. Please enable location access in your browser settings and refresh the map!', btnText: 'OK'})
            setIsModalShown(true)
            break;
          case error.code === 2:
            setModalData({type: 'Warning', text: 'Location information is unavailable.', btnText: 'OK'})
            setIsModalShown(true)
            break;
          case error.code === 3:
            setModalData({type: 'Warning', text: 'The request to get location timed out.', btnText: 'OK'})
            setIsModalShown(true)
            break;
          default:
            setModalData({type: 'Warning', text: 'An unknown error occurred.', btnText: 'OK'})
            setIsModalShown(true)
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000
      }
    );

    // Cleanup function
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);*/

  return (
    <div className="relative h-screen w-full">
      <Head>
        <title>PonyparkCity Map</title>
        <meta name="description" content="Interactive map of PonyparkCity" />
        <meta property="og:title" content="PonyparkCity Map" />
        <meta property="og:description" content="Interactive map of PonyparkCity" />
      </Head>      
      <Map
        selectedHouse={selectedHouse}
        routeShouldRun={routeRequest}
        routeVisible={routeVisible}
        filters={filterCategories}
        userLocation={location}
        routeDestination={routeDestination}
        onRoutingStart={onRoutingStartHandler}
        onRoutingFinish={routeRequestReset}
        shouldGeolocate={geolocateRequest}
        onGeolocationFinish={geolocateRequestReset}
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
        onGeolocationRequested={geolocateUser}
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
