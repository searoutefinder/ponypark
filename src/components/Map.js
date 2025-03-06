'use client';
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import pois from '../data/pois.json'
import icons from '../data/icons.json'
import HousePopup from './HousePopup'
import PoiPopup from './PoiPopup'

mapboxgl.accessToken = 'pk.eyJ1IjoidGFtaCIsImEiOiJja3B5M2ViM3gwNnE4MnFudXF0ZThwMTJ6In0.c0XLQtMFMUy5vf3v0_R0ww';

const Map = ({openModal, selectedHouse, routeShouldRun, routeVisible, routeDestination, onRouteDestinationSelected, onRoutingStart, onRoutingFinish, onPoiSelected, setLoading, filters, userLocation}) => {
    
    const map = useRef(null);

    const generateFeatureCollection = (feature) => {
      return {"type": "FeatureCollection", "features": [feature]}
    }

    const displayRoute = async (origin, destination) => {
      
      //let origin = [6.598693055084427, 52.59152994287401]
      
      try {
        setLoading(true)

        if(origin === false) {
          throw new Error("Permission denied. Please enable location access in your browser settings and refresh the map!")
        }  
        
        let routingURL = process.env.NEXT_PUBLIC_ROUTING_URL.replace('{origin}', origin.slice(0).reverse().join(',')).replace('{destination}', destination.slice(0).reverse().join(','))
        
        let routeResponseRaw = await fetch(routingURL)
        
        if(routeResponseRaw.status !== 200) {
          throw new Error("Either one or both endpoints of the route falls outside the routing coverage area.")
        }

        let routeResponse = await routeResponseRaw.json()

        // Return if any of the points are out of bounds or there is no route returned
        if(typeof routeResponse.paths === 'undefined') {
          throw new Error("There are no paths returned from the routing service")
        }

        onRoutingStart()

        let polylineGeometry = JSON.parse(JSON.stringify(routeResponse.paths[0].points))
        let destinationPoint = destination.slice(0)

        // Update the source of the route-layer with the generated route's JSON
        map.current.getSource('route-src')
          .setData({
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                properties: {},
                geometry: {
                  type: "LineString",
                  coordinates: [...polylineGeometry.coordinates]
                }
              }
            ]
          })
        
        
        map.current.getSource('route-extension-src')
          .setData({
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                properties: {},
                geometry: {
                  type: "LineString",
                  coordinates: [...[polylineGeometry.coordinates[polylineGeometry.coordinates.length-1]], [...destinationPoint]]
                }
              }
            ]
          })         

        // Adjust map to the bounds of the generated route  
        zoomToBounds(routeResponse.paths[0].points.coordinates)

        if(routeVisible){
          map.current.setLayoutProperty('route-layer', 'visibility', 'visible')
          map.current.setLayoutProperty('route-extension-layer', 'visibility', 'visible')
        }      

        setLoading(false)
      }
      catch(error) {
        console.log(error)
        openModal({type: 'Warning', text: error.message, btnText: 'OK'})
      }
    }

    const zoomToBounds = (coords) => {
      let bounds = new mapboxgl.LngLatBounds
      coords.forEach((point) => {
        bounds.extend(point)
      })

      map.current.fitBounds(bounds, {padding: {top: 50, bottom:50, left: 50, right: 50}})        
    }

    const filterPOIs = (filterCategories) => {
      // Return if the map ref is null or if the poi-layer is not ready/loaded
      if(map.current === null ||typeof map.current.getLayer('poi-layer') === 'undefined') { return }
      
      if(filterCategories.length > 0) {
        map.current.setFilter('poi-layer', ['in', ['get', 'icon'], ['literal', filterCategories]])
      }
      else
      {
        map.current.setFilter('poi-layer', ['==', ['get', 'id'], 9999])
      }
    }

    const retrieveGeometryFromPointFeature = (feature) => {
      if (
        typeof feature !== 'object' ||
        feature === null ||
        Object.keys(feature).length === 0
      ) {
        return false;
      }
    
      if (
        feature.geometry?.type !== 'Point' ||
        !Array.isArray(feature.geometry?.coordinates) ||
        feature.geometry.coordinates.length === 0
      ) {
        return false;
      }
    
      return feature.geometry.coordinates;  
    }

    useEffect(() => {
      if(routeShouldRun === false) { return }
      
      // Render the route between the two points
      displayRoute(retrieveGeometryFromPointFeature(userLocation), retrieveGeometryFromPointFeature(routeDestination))

      // Signal back to the page that routing has been started
      onRoutingFinish()
    }, [routeShouldRun])

    // define the map, runs only once
    useEffect(() => {
      if (map.current) return;
  
      map.current = new mapboxgl.Map({
        container: 'map',
        
        /*style: {
          version: 8,
          sources: {},
          layers: [
            {
              id: 'background',
              type: 'background',
              paint: {
                'background-color': '#f6e7b4'
              }
            }
          ]
        },*/
        center: [process.env.NEXT_PUBLIC_MAPBOX_CENTER_LNG, process.env.NEXT_PUBLIC_MAPBOX_CENTER_LAT],
        zoom: process.env.NEXT_PUBLIC_MAPBOX_ZOOM,
        //minZoom: process.env.NEXT_PUBLIC_MAPBOX_ZOOM
      });

      map.popup = new mapboxgl.Popup({closeButton: false})
      map.poiPopup = new mapboxgl.Popup({closeButton: false})

      map.current.on('load', () => {

        icons.forEach((icon, index) => {
          map.current.loadImage(icon.url, (error, image) => {
            if (error) throw error;
            if (!map.current.hasImage(icon.name)) {
              map.current.addImage(icon.name, image);
            }     
          })
        })

        // Add sources and layers
        map.current.addSource('userlocation-src', {
          type: 'geojson',
          data: {type: "FeatureCollection", features: []}
        })

        map.current.addSource('route-src', {
          type: 'geojson',
          data: {type: "FeatureCollection", features: []}
        }) 

        map.current.addSource('route-extension-src', {
          type: 'geojson',
          data: {type: "FeatureCollection", features: []}
        })
        
        map.current.addSource('poi-src', {
          type: 'geojson',
          data: pois
        })        

        map.current.addSource('map-plot-src', {
          'type': 'raster',
          'url': 'mapbox://michelarkes.cl719z86'
        });


        map.current.addLayer({
          id: 'map-plot-lyr',
          type: 'raster',
          source: 'map-plot-src',
          minzoom: 0,
          maxzoom: 22          
        }); 

        map.current.addLayer({
          id: 'poi-layer',
          type: 'symbol',
          source: 'poi-src',
          layout: {
            'icon-allow-overlap': true,
            'icon-size': 0.5,
            'icon-image': ['get', 'icon']
          }
        })

        map.current.addLayer({
          id: 'userlocation-layer',
          type: 'circle',
          source: 'userlocation-src',
          paint: {
            'circle-radius': 10,
            'circle-color': '#FF0000'
          }
        })                      

        map.current.addLayer({
          id: 'route-layer',
          type: 'line',
          source: 'route-src',
          visibility: 'hidden',
          layout: {
            'line-join': 'round'
          },
          paint: {
            'line-width': 5,
            'line-color': '#000'
          }
        })
        
        map.current.addLayer({
          id: 'route-extension-layer',
          type: 'line',
          source: 'route-extension-src',
          visibility: 'hidden',
          layout: {
            'line-join': 'round'
          },
          paint: {
            'line-width': 5,
            'line-color': '#000',
            'line-dasharray': [1, 2]
          }
        })        
         
        // Add click event
        map.current.on("click", "poi-layer", (e) => {
          
          // Generate a popup component dynamically
          const poiFeature = {...{type: "Feature"}, ...{properties: {...e.features[0].properties}}, ...{geometry: {...e.features[0].geometry}}}
          const popupContainer = document.createElement('div');
          const root = createRoot(popupContainer);
          root.render(<PoiPopup name={e.features[0].properties.name} poiData={poiFeature} onDirectionButtonPressed={onPoiSelected}/>);             
          
          map.poiPopup
            .setLngLat(e.features[0].geometry.coordinates)
            .setDOMContent(popupContainer)
            .addTo(map.current)            
        })        
        
      })
  
    }, []);

    // filters prop changed
    useEffect(() => {

      // Select category names based on incoming IDs
      let filteredIcons = icons.filter((icon) => {
        return filters.indexOf(icon.id) > -1
      })
      let categories = filteredIcons.map((category) => {
        return category.name
      })

      // Filter the POI layer for the categories
      filterPOIs(categories)
    }, [filters])

    // routeVisible prop changed
    useEffect(() => {
      if(typeof map.current.getLayer('route-layer') === 'undefined') { return }
      if(!routeVisible) {
        map.current.setLayoutProperty('route-layer', 'visibility', 'none')
        map.current.setLayoutProperty('route-extension-layer', 'visibility', 'none')
        map.popup.remove()
      }
      else
      {
        map.current.setLayoutProperty('route-layer', 'visibility', 'visible')
        map.current.setLayoutProperty('route-extension-layer', 'visibility', 'visible')
      }
    }, [routeVisible])

    // selectedHouse prop changed
    useEffect(() => {
      if(selectedHouse === null) { return }
      if(!map.current) { return }

      map.current.setCenter(selectedHouse.geometry.coordinates)
      map.current.setZoom(19)

      const popupContainer = document.createElement('div');
      const root = createRoot(popupContainer);
      root.render(<HousePopup houseData={selectedHouse} onDirectionPressed={onRouteDestinationSelected}/>); 

      map.popup
        .setLngLat(selectedHouse.geometry.coordinates)
        .setDOMContent(popupContainer)
        .addTo(map.current)

    }, [selectedHouse])
    
    // userLocation prop changed
    useEffect(() => {
      console.log(userLocation)
      if(typeof map.current.getSource('userlocation-src') !== 'undefined') {
        map.current.getSource('userlocation-src').setData(generateFeatureCollection(userLocation))
      }
    }, [userLocation])

    return (
      <div id="map" className="absolute top-0 left-0 w-full h-full"></div>
    );
}

export default Map