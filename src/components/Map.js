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

const Map = ({openModal, selectedHouse, routeShouldRun, routeVisible, routeDestination, onRouteDestinationSelected, onRoutingStart, onRoutingFinish, shouldGeolocate, onGeolocationFinish, onPoiSelected, setLoading, filters, userLocation}) => {
    
    const [markerSize, setMarkerSize] = useState(150); 

    const map = useRef(null);
    const selectedHouseRef = useRef(selectedHouse);

    const generateFeatureCollection = (feature = undefined) => {
      if(typeof feature === 'undefined') {
        return {"type": "FeatureCollection", "features": []}
      }
      else
      {
        return {"type": "FeatureCollection", "features": [feature]}
      }
    }

    const displayRoute = async (origin, destination) => {
      
      origin = [6.598693055084427, 52.59152994287401]
      
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
        openModal({type: 'Warning', text: error.message, btnText: 'OK'})
      }
    }

    const displaySelectedHouse = () => {
      if(typeof map.current === 'undefined') { return }
      map.current.getSource('selectedhouse-src').setData(generateFeatureCollection(selectedHouse))           
    }

    const hideSelectedHouse = () => {
      if(typeof map.current === 'undefined' || typeof map.current.getSource('selectedhouse-src') === 'undefined') { return }
      map.current.getSource('selectedhouse-src').setData(generateFeatureCollection())      
    }

    const zoomToBounds = (coords) => {
      let bounds = new mapboxgl.LngLatBounds
      coords.forEach((point) => {
        bounds.extend(point)
      })

      map.current.fitBounds(bounds, {padding: {top: 50, bottom:50, left: 50, right: 50}})        
    }

    const zoomToCurrentPosition = () => {
      if(typeof userLocation === null) { return }
      if(typeof map.current === 'undefined') { return }
      map.current.setCenter(userLocation.geometry.coordinates)
      map.current.setZoom(13)
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

    const selectedHouseClickHandler = () => {

      if(selectedHouseRef.current === null) { return }

      const popupContainer = document.createElement('div');
      const root = createRoot(popupContainer);
      root.render(<HousePopup houseData={selectedHouseRef.current} onDirectionPressed={onRouteDestinationSelected}/>); 
      
      map.popup
        .setLngLat(selectedHouseRef.current.geometry.coordinates)
        .setOffset([0, -10])
        .setDOMContent(popupContainer)
        .addTo(map.current)       
    }

    const poiRoutingStartHandler = (data) => {
      onPoiSelected(data)
      map.poiPopup.remove()
    }

    const pulsingDot = {
      width: markerSize,
      height: markerSize,
      data: new Uint8Array(markerSize * markerSize * 4),

      // When the layer is added to the map,
      // get the rendering context for the map canvas.
      onAdd: function () {
          const canvas = document.createElement('canvas');
          canvas.width = this.width;
          canvas.height = this.height;
          this.context = canvas.getContext('2d');
      },

      // Call once before every frame where the icon will be used.
      render: function () {
          const duration = 1000;
          const t = (performance.now() % duration) / duration;

          const radius = (markerSize / 2) * 0.3;
          const outerRadius = (markerSize / 2) * 0.7 * t + radius;
          const context = this.context;

          // Draw the outer circle.
          context.clearRect(0, 0, this.width, this.height);
          context.beginPath();
          context.arc(
              this.width / 2,
              this.height / 2,
              outerRadius,
              0,
              Math.PI * 2
          );
          context.fillStyle = `rgba(45, 122, 247, ${1 - t})`;
          context.fill();

          // Draw the inner circle.
          context.beginPath();
          context.arc(
              this.width / 2,
              this.height / 2,
              radius,
              0,
              Math.PI * 2
          );
          context.fillStyle = 'rgba(45, 122, 247, 1)';
          context.strokeStyle = 'white';
          context.lineWidth = 2 + 4 * (1 - t);
          context.fill();
          context.stroke();

          // Update this image's data with data from the canvas.
          this.data = context.getImageData(
              0,
              0,
              this.width,
              this.height
          ).data;

          // Continuously repaint the map, resulting
          // in the smooth animation of the dot.
          map.current.triggerRepaint();

          // Return `true` to let the map know that the image was updated.
          return true;
      }
    }    

    useEffect(() => {
      if(routeShouldRun === false) { return }
      
      // Render the route between the two points
      displayRoute(retrieveGeometryFromPointFeature(userLocation), retrieveGeometryFromPointFeature(routeDestination))

      // Signal back to the page that routing has been started
      onRoutingFinish()
    }, [routeShouldRun])

    useEffect(() => {
      if(shouldGeolocate === false) { return }
      
      zoomToCurrentPosition()

      onGeolocationFinish()
    }, [shouldGeolocate])    

    // define the map, runs only once
    useEffect(() => {
      if (map.current) return;
  
      map.current = new mapboxgl.Map({
        container: 'map',
        style: {
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
        },
        center: [process.env.NEXT_PUBLIC_MAPBOX_CENTER_LNG, process.env.NEXT_PUBLIC_MAPBOX_CENTER_LAT],
        zoom: process.env.NEXT_PUBLIC_MAPBOX_ZOOM,
        minZoom: process.env.NEXT_PUBLIC_MAPBOX_ZOOM
      });

      map.current.addImage('pulsing-dot', pulsingDot, { pixelRatio: 2 });

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

        map.current.addSource('selectedhouse-src', {
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
          'url': process.env.NEXT_PUBLIC_MAPBOX_RASTERTILESET
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
          type: 'symbol',
          source: 'userlocation-src',
          layout: {
            'icon-image': 'pulsing-dot'
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
        
        map.current.addLayer({
          id: 'selectedhouse-layer',
          type: 'circle',
          source: 'selectedhouse-src',
          paint: {
            'circle-radius': 10,
            'circle-color': '#FF0000'
          }
        })        
         
        // Add click event
        map.current.on("click", "poi-layer", (e) => {
          
          // Generate a popup component dynamically
          const poiFeature = {...{type: "Feature"}, ...{properties: {...e.features[0].properties}}, ...{geometry: {...e.features[0].geometry}}}
          const popupContainer = document.createElement('div');
          const root = createRoot(popupContainer);
          root.render(<PoiPopup name={e.features[0].properties.name} poiData={poiFeature} onDirectionButtonPressed={poiRoutingStartHandler}/>);             
          
          map.poiPopup
            .setLngLat(e.features[0].geometry.coordinates)
            .setDOMContent(popupContainer)
            .addTo(map.current)            
        }) 

        map.current.on("click", "selectedhouse-layer", selectedHouseClickHandler)
                
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
      }
      else
      {
        map.current.setLayoutProperty('route-layer', 'visibility', 'visible')
        map.current.setLayoutProperty('route-extension-layer', 'visibility', 'visible')
        map.popup.remove()
      }
    }, [routeVisible])

    // selectedHouse prop changed
    useEffect(() => {
      
      selectedHouseRef.current = selectedHouse;

      if(!map.current) { return }
      if(selectedHouseRef.current === null) {       
        // Hide map marker
        hideSelectedHouse()

        // Hide map popup
        map.popup.remove()
        return 
      }

      map.current.setCenter(selectedHouseRef.current.geometry.coordinates)
      map.current.setZoom(17)

      // Display map marker
      displaySelectedHouse()

      // Display map popup
      const popupContainer = document.createElement('div');
      const root = createRoot(popupContainer);
      root.render(<HousePopup houseData={selectedHouseRef.current} onDirectionPressed={onRouteDestinationSelected}/>); 
      
      map.popup
        .setLngLat(selectedHouseRef.current.geometry.coordinates)
        .setOffset([0, -10])
        .setDOMContent(popupContainer)
        .addTo(map.current)
       
    }, [selectedHouse])
    
    // userLocation prop changed
    useEffect(() => {
      if(typeof map.current.getSource('userlocation-src') !== 'undefined') {
        map.current.getSource('userlocation-src').setData(generateFeatureCollection(userLocation))
      }
    }, [userLocation])

    return (
      <div id="map" className="absolute top-0 left-0 w-full h-full"></div>
    );
}

export default Map