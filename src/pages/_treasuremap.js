"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Map from '../components/Map'
import SearchBar from '../components/SearchBar';
import LoaderScreen from '../components/LoaderScreen';
import Modal from '../components/Modal';
import QuestionModal from '../components/QuestionModal/QuestionModal';
import QrScannerOverlay from "../components/QrScanner/QrScanner";

// Context
import { useAppUi } from "../context/AppUiContext";
import { useTreasureData } from "../context/TreasureDataContext";


export default function TreasureMapPage() {
  
  // Router and URL parsing
  const router = useRouter();
  const { destination } = router.query;

  // State
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [selectedPoi, setSelectedPoi] = useState(null);

  const [routeDestination, setRouteDestination] = useState(null);
  const [routeVisible, setRouteVisible] = useState(false);
  const [routeRequest, setRouteRequest] = useState(false);
  const [geolocateRequest, setGeolocateRequest] = useState(false);
  const [filterCategories, setFilterCategories] = useState([]);
  const [location, setLocation] = useState(null);

  const [treasureId, setTreasureId] = useState(null);
  const [treasureRow, setTreasureRow] = useState(null);
  const [qrOpen, setQrOpen] = useState(false);

  // Context
  const { rows, loading: treasureLoading, error: treasureError } = useTreasureData();
  const { 
    isLoading,
    isModalShown,
    isQuestionModalShown,
    modalData,
    setLoading,
    openModal,
    closeModal,
    openQuestionModal,
    closeQuestionModal
  } = useAppUi();  
  
  // Handlers

  // POI has been selected by click using the map
  const poiSelectedHandler = (data) => {
    
    setSelectedPoi(data)
    setRouteDestination(data)
    
    //Signal to the map component that it should perform a routing operation
    setRouteRequest(true)    
  }

  const treasureRoutingSelectedHandler = (data) => {
    
    setRouteDestination(data);
    
    //Signal to the map component that it should perform a routing operation
    setRouteRequest(true);
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
      openModal({type: 'Warning', text: `Geolocation is not supported by your browser.`, btnText: 'OK'})
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
            openModal({type: 'Warning', text: 'Permission denied. Please enable location access in your browser settings.', btnText: 'OK'})
            break;
          case 2:
            openModal({type: 'Warning', text: 'Location information is unavailable.', btnText: 'OK'})
            break;
          case 3:
            openModal({type: 'Warning', text: 'The request to get location timed out.', btnText: 'OK'})
            break;
          default:
            openModal({type: 'Warning', text: 'An unknown error occurred.', btnText: 'OK'})
        }
      },
      { enableHighAccuracy: true, maximumAge: 10000 }
    );        
  }

  // Set the flag that indicates to the map if a routing is needed or not
  const geolocateRequestReset = () => {
    setGeolocateRequest(false)
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

  const questionModalCloseHandler = useCallback(() => {
    closeModal()
  }, [closeModal]);

  const modalCloseHandler = useCallback(() => {
    closeModal()
  }, [closeModal])

  const onQrResult = useCallback((id) => {
    setQrOpen(false);

    // URL rewrite without reload
    router.replace(`/treasuremap/${id}`, undefined, { shallow: true, scroll: false });

    // itt indíthatod a kérdéssort is:
    // loadQuestions(id); 
    // setQuizOpen(true);
  }, [router]);
  
  const treasureClickedHandler = useCallback(() => {
    setQrOpen(true);
  }, [])

  const closeQrOverlay = useCallback(() => {
    setQrOpen(false);
  }, [])

  // Hooks

  // Geolocation
  useEffect(() => {
    if (!navigator.geolocation) {
      openModal({type: 'Warning', text: `Geolocation is not supported by your browser.`, btnText: 'OK'})
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
            openModal({type: 'Warning', text: 'Permission denied. Please enable location access in your browser settings.', btnText: 'OK'})
            break;
          case 2:
            openModal({type: 'Warning', text: 'Location information is unavailable.', btnText: 'OK'})
            break;
          case 3:
            openModal({type: 'Warning', text: 'The request to get location timed out.', btnText: 'OK'})
            break;
          default:
            openModal({type: 'Warning', text: 'An unknown error occurred.', btnText: 'OK'})
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
            openModal({type: 'Warning', text: 'Permission denied. Please enable location access in your browser settings and refresh the map!', btnText: 'OK'})
            break;
          case error.code === 2:
            openModal({type: 'Warning', text: 'Location information is unavailable.', btnText: 'OK'})
            break;
          case error.code === 3:
            openModal({type: 'Warning', text: 'The request to get location timed out.', btnText: 'OK'})
            break;
          default:
            openModal({type: 'Warning', text: 'An unknown error occurred.', btnText: 'OK'})
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000
      }
    );

    // Cleanup function
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Read from treasure URL and save results to state
  useEffect(() => {
    if (!router.isReady) return;

    const path = typeof window !== "undefined" ? window.location.pathname : "";
    const match = path.match(/^\/treasuremap\/(\d+)\/?$/);

    if(match === null) { return; }

    setTreasureId(match ? Number(match[1]) : null);
  }, [router.isReady, router.asPath]);

  // Monitor changes to treasureId
  useEffect(() => {

    if(treasureId === null) { 
      setTreasureRow(null);
      return 
    }
    
    if (treasureLoading || treasureError) return;

    const match = rows.find((row) => Number(row.treasure_id) === Number(treasureId));
    
    // Copy the data for the matched row into the treasureRow state variable
    setTreasureRow(match ?? null);

  }, [treasureId, rows, treasureLoading, treasureError]);

  // Monitor changes to treasureRow, the state value that holds the full details for a given treasure
  useEffect(() => {
    if (!treasureRow) return;

    console.log("Aktuális treasure:", treasureRow); 
    openQuestionModal(treasureRow);
  }, [treasureRow]);

  return (
    <div className="relative h-screen w-full">
      <Head>
        <title>PonyparkCity Map</title>
        <meta name="description" content="Interactive map of PonyparkCity" />
        <meta property="og:title" content="PonyparkCity Map" />
        <meta property="og:description" content="Interactive map of PonyparkCity" />
      </Head>      
      <Map
        mode={"treasure"}
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
        onRouteDestinationSelected={routeDestinationSelectedHandler}
        onPoiSelected={poiSelectedHandler}
        onTreasureRouting={treasureRoutingSelectedHandler}
        treasures={rows}
        selectedTreasure={treasureRow}
        onTreasureClicked={treasureClickedHandler}
      />
      <SearchBar
        isLegendButtonVisible={false}
        destination={destination}
        onSuggestionSelected={searchBarSuggestionSelected}
        onQueryCancel={searchBarQueryCanceled}
        onFilterChange={filtersChangeHandler}
        onGeolocationRequested={geolocateUser}
      />
      <QrScannerOverlay
        open={qrOpen}
        onClose={closeQrOverlay}
        onResult={onQrResult}
      />



      {isLoading ?
        <LoaderScreen />
        : ''
      }

      {(isModalShown && modalData !== null) ?
        <Modal
          messageType={modalData.type}
          messageText={modalData.text}
          buttonText={modalData.btnText}
          onButtonClick={modalCloseHandler}
        />     
        : ''
      }

      {
        (isQuestionModalShown === true) ? 
          <QuestionModal
            data={treasureRow} 
            buttonText={"Close"}
            onButtonClick={closeQuestionModal}
          /> 
          : ''
      }
    </div>
  );

}
