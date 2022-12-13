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
          'icon-size': 0.08
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
          'circle-radius': 5,
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
            'circle-radius': 25,
            'circle-color': 'yellow'
          }
        },
        'spd-layer'
        );

        map.flyTo({
          center: oisFeature.geometry.coordinates,
          zoom: 12
        });

        summarizeOIS(oisFeature.properties);
      });
    });
  }

  // Populates the sidebar with information regarding the shooting clicked on
  function summarizeOIS(data) {
    const oisInfo = document.getElementById('ois-info');
    oisInfo.classList.remove('hidden');
    document.getElementById('officerRace').innerText = ' ' + data['Officer Race'];
    document.getElementById('subjRace').innerText = ' ' + data['Subject Race'];
    document.getElementById('fatal').innerText = ' ' + data['Fatal'];
    document.getElementById('summary').innerText = '\n' + data['Summary'];
  }

  function fitToScreen() {
    if (window.innerWidth < 900) {
      document.querySelectorAll('#title p').forEach( item => {
        item.classList.add('hidden');
      })
      document.getElementById('data').classList.add('hidden');
    } else {
      document.querySelectorAll('#title > p').forEach( item => {
        item.classList.remove('hidden');
      })
      document.getElementById('data').classList.remove('hidden');
    }
  }

  // Initializing function called after the DOM is loaded in
  function init() {
    map = new mapboxgl.Map({
      container: 'map', // container ID
      style: 'mapbox://styles/samaffolder/cl2jvuxtg003i14l26mtl63h6',
      center: [-122.3, 47.62], // Centered on Seattle
      zoom: 10.5
    });

    map.loadImage('imgs/spdIcon3.png', (error, icon) => { // load in the icon for police
      if (error) throw error;
      map.addImage('policeIcon', icon);
    });

    document.getElementById('remove').addEventListener('click', () => {document.getElementById('ois-info').classList.add('hidden');});
    window.addEventListener('resize', () => {
      fitToScreen();
    });

    fitToScreen();
    geojsonFetch();

  }
})();