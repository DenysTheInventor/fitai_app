import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import type { DailyLog, OutdoorRunActivity, View } from '../types';
import { ActivityType } from '../types';
import { useLocationTracker } from '../hooks/useLocationTracker';

interface MapViewProps {
  selectedDateLog: DailyLog;
  onUpdateLog: (updatedLog: DailyLog) => void;
  setView: (view: View) => void;
  setSelectedActivityId: (id: string) => void;
}

const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const seconds = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

const formatPace = (pace: number): string => {
    if (pace === 0 || !isFinite(pace)) return '0:00';
    const minutes = Math.floor(pace);
    const seconds = Math.round((pace - minutes) * 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
}

const MapView: React.FC<MapViewProps> = ({ selectedDateLog, onUpdateLog, setView, setSelectedActivityId }) => {
    const mapRef = useRef<L.Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const polylineRef = useRef<L.Polyline[]>([]);
    const userMarkerRef = useRef<L.Marker | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [activityName, setActivityName] = useState('Morning Run');
    
    const { 
        isTracking, isPaused, path, flatPath, stats, error, 
        startTracking, pauseTracking, resumeTracking, stopTracking 
    } = useLocationTracker();

    useEffect(() => {
        if (mapContainerRef.current && !mapRef.current) {
            const map = L.map(mapContainerRef.current, { zoomControl: false }).setView([51.505, -0.09], 13);
            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
                subdomains: 'abcd',
                maxZoom: 20
            }).addTo(map);
            mapRef.current = map;
            
            map.locate({ setView: true, maxZoom: 16, watch: false });
            
            // Failsafe to ensure map renders correctly after layout settles
            setTimeout(() => {
                map.invalidateSize();
            }, 100);
        }
    }, []);

    useEffect(() => {
        if (mapRef.current && flatPath.length > 0) {
            const latestPoint = flatPath[flatPath.length - 1];
            const latLng: L.LatLngTuple = [latestPoint.lat, latestPoint.lng];

            if (!userMarkerRef.current) {
                userMarkerRef.current = L.marker(latLng).addTo(mapRef.current);
            } else {
                userMarkerRef.current.setLatLng(latLng);
            }
            if (isTracking && !isPaused) {
                mapRef.current.panTo(latLng);
            }
        }
        
        if (mapRef.current) {
            polylineRef.current.forEach(pl => pl.remove());
            polylineRef.current = [];

            path.forEach(segment => {
                if (segment.length > 1) {
                    const latLngs = segment.map(p => [p.lat, p.lng] as L.LatLngTuple);
                    const newPolyline = L.polyline(latLngs, { color: '#00F5D4', weight: 4 }).addTo(mapRef.current!);
                    polylineRef.current.push(newPolyline);
                }
            });
        }

    }, [path, flatPath, isTracking, isPaused]);

    const handleFinish = () => {
        if (window.confirm("Are you sure you want to finish this activity?")) {
            setIsSaving(true);
            stopTracking(false);
        }
    };

    const handleSave = () => {
        if (stats.distanceKm < 0.01) {
            alert("Activity too short to save.");
            handleCancelSave();
            return;
        }

        const newActivity: OutdoorRunActivity = {
            id: new Date().toISOString(),
            name: activityName || `Run on ${new Date().toLocaleDateString()}`,
            type: ActivityType.OutdoorRun,
            durationSeconds: Math.round(stats.durationSeconds),
            distanceKm: parseFloat(stats.distanceKm.toFixed(2)),
            route: flatPath,
        };
        
        onUpdateLog({ ...selectedDateLog, workouts: [...selectedDateLog.workouts, newActivity] });
        setSelectedActivityId(newActivity.id);
        setView('activity-summary');
    };

    const handleCancelSave = () => {
        setIsSaving(false);
        stopTracking(true);
        if (userMarkerRef.current) {
             userMarkerRef.current.remove();
             userMarkerRef.current = null;
        }
        polylineRef.current.forEach(pl => pl.remove());
        polylineRef.current = [];
    };

    return (
        <div className="relative h-full w-full">
            {/* Map Container - Stretches to fill the entire space */}
            <div id="map-container" ref={mapContainerRef} className="absolute inset-0 z-0"></div>
            
            {/* Stats Display - Overlaid at the top */}
            <div className="absolute top-0 left-0 right-0 z-10 p-4">
                <div className="bg-dark-surface/90 backdrop-blur-md p-4 rounded-lg grid grid-cols-3 gap-4 text-center">
                    <div>
                        <p className="text-xs text-dark-text-secondary">DISTANCE (KM)</p>
                        <p className="text-2xl font-bold text-white">{stats.distanceKm.toFixed(2)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-dark-text-secondary">TIME</p>
                        <p className="text-2xl font-bold text-white">{formatTime(stats.durationSeconds)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-dark-text-secondary">PACE (/KM)</p>
                        <p className="text-2xl font-bold text-white">{formatPace(stats.paceMinPerKm)}</p>
                    </div>
                </div>
            </div>
            
            {/* Error Display */}
            {error && <div className="absolute top-32 left-4 right-4 bg-red-900/80 border border-red-500 text-red-300 p-3 rounded-lg z-10 text-sm">{error}</div>}

            {/* Control Buttons - Overlaid at the bottom */}
            <div className="absolute bottom-4 left-0 right-0 z-10">
                <div className="flex justify-around items-center">
                    {!isTracking ? (
                        <button onClick={startTracking} className="w-20 h-20 bg-brand-secondary rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg hover:scale-105 transition-transform">
                            START
                        </button>
                    ) : (
                        <>
                           {!isPaused ? (
                             <button onClick={pauseTracking} className="px-6 py-3 bg-yellow-600 rounded-full text-white font-semibold">PAUSE</button>
                           ) : (
                             <button onClick={resumeTracking} className="px-6 py-3 bg-green-600 rounded-full text-white font-semibold">RESUME</button>
                           )}
                           <button onClick={handleFinish} className="px-6 py-3 bg-red-600 rounded-full text-white font-semibold">FINISH</button>
                        </>
                    )}
                </div>
            </div>

            {/* Save Modal */}
            {isSaving && (
                <div className="fixed inset-0 bg-black/70 z-[2000] flex items-center justify-center p-4">
                    <div className="bg-dark-surface rounded-lg p-6 w-full max-w-sm shadow-xl space-y-4">
                        <h2 className="text-xl font-bold text-white">Save Activity</h2>
                        <div>
                            <label className="block text-sm font-medium text-dark-text-secondary mb-1">Activity Name</label>
                            <input type="text" value={activityName} onChange={e => setActivityName(e.target.value)} className="w-full bg-dark-card border border-white/20 rounded-md p-2 text-dark-text" />
                        </div>
                        <div className="flex justify-end gap-3">
                            <button onClick={handleCancelSave} className="px-4 py-2 rounded-md bg-dark-card text-dark-text hover:bg-white/10">Discard</button>
                            <button onClick={handleSave} className="px-4 py-2 rounded-md bg-brand-primary text-dark-bg font-semibold">Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MapView;