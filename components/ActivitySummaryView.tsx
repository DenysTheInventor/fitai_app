import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { OutdoorRunActivity } from '../types';

interface ActivitySummaryViewProps {
  activity: OutdoorRunActivity | undefined;
  goBack: () => void;
}

const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    if (hours > 0) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

const formatPace = (pace: number): string => {
    if (pace === 0 || !isFinite(pace)) return '0:00';
    const minutes = Math.floor(pace);
    const seconds = Math.round((pace - minutes) * 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
}

const ActivitySummaryView: React.FC<ActivitySummaryViewProps> = ({ activity, goBack }) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current && activity?.route && activity.route.length > 0) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: false,
      }).setView([51.505, -0.09], 13);
      
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      }).addTo(map);

      const latLngs = activity.route.map(p => [p.lat, p.lng] as L.LatLngTuple);
      const polyline = L.polyline(latLngs, { color: '#16a34a', weight: 4 }).addTo(map);
      
      map.fitBounds(polyline.getBounds(), { padding: [20, 20] });
      
      mapRef.current = map;
    }
    
    return () => {
        if (mapRef.current) {
            mapRef.current.remove();
            mapRef.current = null;
        }
    };
  }, [activity]);

  if (!activity) {
    return (
      <div className="text-center py-10 px-4">
        <p className="text-dark-text-secondary">Activity not found.</p>
        <button onClick={goBack} className="text-brand-primary mt-4 font-semibold">Go Back</button>
      </div>
    );
  }
  
  const pace = activity.distanceKm > 0 ? (activity.durationSeconds / 60) / activity.distanceKm : 0;
  const activityDate = new Date(activity.id);

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex-shrink-0 h-1/3" ref={mapContainerRef} id="summary-map-container"></div>
      
      <div className="flex-grow p-4 space-y-4 overflow-y-auto">
        <div className="bg-dark-surface p-4 rounded-lg">
            <p className="text-dark-text-secondary text-sm">{activityDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <h2 className="text-2xl font-bold text-white">{activity.name}</h2>
        </div>
        <div className="bg-dark-surface p-4 rounded-lg grid grid-cols-3 gap-4 text-center">
            <div>
                <p className="text-xs text-dark-text-secondary">DISTANCE</p>
                <p className="text-2xl font-bold text-white">{activity.distanceKm.toFixed(2)}<span className="text-lg text-dark-text-secondary ml-1">km</span></p>
            </div>
            <div>
                <p className="text-xs text-dark-text-secondary">TIME</p>
                <p className="text-2xl font-bold text-white">{formatTime(activity.durationSeconds)}</p>
            </div>
            <div>
                <p className="text-xs text-dark-text-secondary">PACE</p>
                <p className="text-2xl font-bold text-white">{formatPace(pace)}<span className="text-lg text-dark-text-secondary ml-1">/km</span></p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ActivitySummaryView;