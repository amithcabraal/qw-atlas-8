// Custom style that shows borders but hides country labels
export const GAMEPLAY_STYLE = {
  version: 8,
  sources: {
    'mapbox-countries': {
      type: 'vector',
      url: 'mapbox://mapbox.country-boundaries-v1'
    },
    'satellite': {
      type: 'raster',
      tiles: [
        'https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/{z}/{x}/{y}?access_token=' + import.meta.env.VITE_MAPBOX_TOKEN
      ],
      tileSize: 256
    }
  },
  layers: [
    // Satellite base layer
    {
      id: 'satellite',
      type: 'raster',
      source: 'satellite',
      paint: {
        'raster-opacity': 0.6
      }
    },
    // Country borders
    {
      id: 'country-boundaries',
      type: 'line',
      source: 'mapbox-countries',
      'source-layer': 'country_boundaries',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#ffffff',
        'line-width': 1,
        'line-opacity': 0.5
      }
    }
  ]
};

export const MAP_STYLES = {
  satellite: "mapbox://styles/mapbox/satellite-streets-v12",
  dark: "mapbox://styles/mapbox/dark-v11",
  gameplay: GAMEPLAY_STYLE
};