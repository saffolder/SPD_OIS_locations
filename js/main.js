/**
 * JS for index.html
 */
'use strict';
(function() {
  window.addEventListener('load', init); // Waits for the DOM to load in before running script

  // Global variables
  let map;
  mapboxgl.accessToken = 'pk.eyJ1Ijoic2FtYWZmb2xkZXIiLCJhIjoiY2wyam9oZmhrMDZhMzNlbzN5MmludTR1aiJ9.vhUMvam1aTt6ygnJsYLpiQ';

  async function geojsonFetch() {
    let response = await fetch('assets/spdLocations.geojson');
    let spdLocations = await response.json();
    let response2 = await fetch('assets/OISCleaned.geojson');
    let oisData = await response2.json();

    map.on('load', () => {

      map.addLayer({ // draw in the locations of SPD
        id: 'spd-layer',
        type: 'symbol',
        source: {
          type: 'geojson',
          data: spdLocations
        },
        layout: {
          'icon-image': 'policeIcon',
          'icon-size': 0.05
        },
        paint: {}
      });

      map.addLayer({ // draw the OIS data
        id: 'ois-layer',
        type: 'circle',
        source: {
          type: 'geojson',
          data: oisData
        },
        paint: {
          'circle-radius': 4,
          'circle-color': 'red'
        }
      });

      // Nearest SPD location code below
      map.addSource('nearest-spd', {
        type: 'geojson',
        data: {
          'type': 'FeatureCollection',
          'features': []
        }
      });

      const popup = new mapboxgl.Popup();

      // add listener for when you hover over an spd location
      map.on('mousemove', (e) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: ['spd-layer', 'ois-layer']
        });
        if (!features.length) {
          popup.remove();
          map.getCanvas().style.cursor = '';
          return;
        }

        const feature = features[0];
        console.log(feature);
        if(feature.layer.id == 'ois-layer') {
          popup.setLngLat(feature.geometry.coordinates).setHTML('OIS shooting').addTo(map);
        } else {
          popup.setLngLat(feature.geometry.coordinates).setHTML(feature.properties.location).addTo(map);
        }


        map.getCanvas().style.cursor = 'pointer';
      });

      // Create Nearest Neighbor function
      map.on('click', (e) => {
        const oisFeatures = map.queryRenderedFeatures(e.point, {
          layers: ['ois-layer']
        });
        if (!oisFeatures.length) {
          return;
        }

        const oisFeature = oisFeatures[0];
        const nearestSPD = turf.nearest(oisFeature, spdLocations);

        if (nearestSPD === null) return;
        map.getSource('nearest-spd').setData({
          'type': 'FeatureCollection',
          'features': [nearestSPD]
        });

        if (map.getLayer('nearest-spd')) {
          map.removeLayer('nearest-spd');
        }

        map.addLayer({
          id: 'nearest-spd',
          type: 'circle',
          source: 'nearest-spd',
          paint: {
            'circle-radius': 20,
            'circle-color': 'yellow'
          }
        },
        'spd-layer'
        );
      });
    });
  }
  // Initializing function called after the DOM is loaded in
 function init() {
    map = new mapboxgl.Map({
      container: 'map', // container ID
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-122.3, 47.62], // Centered on Seattle
      zoom: 10.5
    });

    map.loadImage('imgs/spdIcon3.png', (error, icon) => { // load in the icon for police
      if (error) throw error;
      map.addImage('policeIcon', icon);
    });

    geojsonFetch();
  }
})();