import React, { useLayoutEffect, useRef, useState, useEffect } from 'react';
import L from 'leaflet';
import type { DailyLog, OutdoorRunActivity, View } from '../types';
import { ActivityType } from '../types';
import { useLocationTracker } from '../hooks/useLocationTracker';
import { SunIcon } from '../constants';

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
    const tileLayerRef = useRef<L.TileLayer | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [activityName, setActivityName] = useState('Morning Run');
    const [mapTheme, setMapTheme] = useState<'dark' | 'light'>('dark');
    
    const { 
        isTracking, isPaused, path, flatPath, stats, error, 
        startTracking, pauseTracking, resumeTracking, stopTracking 
    } = useLocationTracker();

    useLayoutEffect(() => {
        if (mapContainerRef.current && !mapRef.current) {
            const map = L.map(mapContainerRef.current, { zoomControl: false }).setView([51.505, -0.09], 13);
            
            tileLayerRef.current = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
                subdomains: 'abcd',
                maxZoom: 20
            }).addTo(map);

            mapRef.current = map;

            map.locate({ setView: true, maxZoom: 16, watch: false });
            
            setTimeout(() => {
                if (mapRef.current) {
                   mapRef.current.invalidateSize();
                }
            }, 100);
        }
    }, []);
    
    useEffect(() => {
        if (tileLayerRef.current && mapRef.current?.attributionControl) {
            const newUrl = mapTheme === 'dark'
                ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
                : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
            const newAttribution = mapTheme === 'dark'
                ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
            
            tileLayerRef.current.setUrl(newUrl);
            mapRef.current.attributionControl.setPrefix(newAttribution);
            // Force redraw of attribution
            tileLayerRef.current.options.attribution = newAttribution;
            if(mapRef.current.attributionControl) {
                (mapRef.current.attributionControl as any)._update();
            }
        }
    }, [mapTheme]);

    useLayoutEffect(() => {
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
                    const newPolyline = L.polyline(latLngs, { color: '#9B5DE5', weight: 5, opacity: 0.9 }).addTo(mapRef.current!);
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
        <div className="absolute top-0 left-0 right-0 bottom-20">
            <div id="map-container" ref={mapContainerRef} className="absolute inset-0 z-0"></div>
            
            {/* Stats Panel */}
            <div className="absolute top-0 left-0 right-0 p-4 z-10">
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
            
            {/* Map Overlays (like the theme button) */}
            <div className="absolute top-28 left-4 z-10">
                 <button 
                    onClick={() => setMapTheme(prev => prev === 'dark' ? 'light' : 'dark')}
                    className="bg-dark-surface/80 backdrop-blur-md w-10 h-10 flex items-center justify-center rounded-full text-dark-text-secondary hover:bg-dark-card hover:text-white transition-colors"
                    aria-label="Toggle map theme"
                >
                    <SunIcon className="w-6 h-6" />
                </button>
            </div>

            {error && <div className="absolute top-24 left-4 right-4 bg-red-900/80 border border-red-500 text-red-300 p-3 rounded-lg z-[1000] text-sm">{error}</div>}

            {/* Controls */}
            <div className="absolute bottom-24 left-0 right-0 z-[1000] flex justify-around items-center">
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