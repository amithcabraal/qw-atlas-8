import mapboxgl from 'mapbox-gl';

export function calculateBounds(coordinates: [number, number][]): mapboxgl.LngLatBounds {
  const bounds = new mapboxgl.LngLatBounds();
  
  coordinates.forEach(([lng, lat]) => {
    bounds.extend([lng, lat]);
  });

  return bounds;
}