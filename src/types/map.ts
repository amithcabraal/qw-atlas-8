import type { LngLatBounds } from 'mapbox-gl';

export interface MapMarker {
  latitude: number;
  longitude: number;
  color?: string;
  fill?: boolean;
  label?: string;
}

export interface MapComponentProps {
  onMapClick?: (e: MapLayerMouseEvent) => void;
  markers?: MapMarker[];
  interactive?: boolean;
  showLabels?: boolean;
  showMarkerLabels?: boolean;
  key?: string;
}

export interface MapRef {
  flyTo: (options: any) => void;
  fitBounds: (bounds: LngLatBounds, options?: any) => void;
}