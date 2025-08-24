import React, { useLayoutEffect, useRef, useState, useEffect, useMemo } from 'react';
import L from 'leaflet';
import type { OutdoorRunActivity, UserSettings } from '../types';
import { ShareIcon } from '../constants';

interface ActivitySummaryViewProps {
  activity: OutdoorRunActivity | undefined;
  goBack: () => void;
  userSettings: UserSettings;
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

const DumbbellIconForShare = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="#9B5DE5" style={{ width: '40px', height: '40px' }}>
      <rect x="6" y="20" width="4" height="24" rx="1"/>
      <rect x="10" y="16" width="6" height="32" rx="1"/>
      <rect x="16" y="12" width="6" height="40" rx="1"/>
      <rect x="22" y="28" width="20" height="8" rx="2"/>
      <rect x="42" y="12" width="6" height="40" rx="1"/>
      <rect x="48" y="16" width="6" height="32" rx="1"/>
      <rect x="54" y="20" width="4" height="24" rx="1"/>
    </svg>
);

const SharePreview: React.FC<{ activity: OutdoorRunActivity; onComplete: () => void; }> = ({ activity, onComplete }) => {
    const previewRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);

    useEffect(() => {
        const generateAndShare = async () => {
            if (!previewRef.current) return;
            
            const mapContainer = previewRef.current.querySelector('.map-container-for-share') as HTMLDivElement;
            if (!mapContainer) return;

            // 1. Render map
            mapRef.current = L.map(mapContainer, { zoomControl: false, preferCanvas: true, attributionControl: false });
            const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapRef.current);
            
            const latLngs = activity.route.map(p => [p.lat, p.lng] as L.LatLngTuple);
            const polyline = L.polyline(latLngs, { color: '#9B5DE5', weight: 5 }).addTo(mapRef.current);
            mapRef.current.fitBounds(polyline.getBounds(), { padding: [40, 40] });

            // 2. Wait for map to load
            await new Promise<void>(resolve => {
                tileLayer.on('load', () => resolve());
            });
            
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // 3. Capture with html2canvas
            try {
                const { default: html2canvas } = await import('https://esm.sh/html2canvas');
                const canvas = await html2canvas(previewRef.current, { useCORS: true });
                canvas.toBlob(async (blob) => {
                    if (blob && navigator.share) {
                        const file = new File([blob], 'activity-summary.png', { type: 'image/png' });
                        await navigator.share({
                            title: activity.name,
                            text: `Check out my run: ${activity.distanceKm.toFixed(2)} km!`,
                            files: [file],
                        });
                    } else {
                         alert("Could not generate image for sharing.");
                    }
                }, 'image/png');
            } catch (e) {
                console.error("Sharing failed", e);
                alert("Could not share the image.");
            } finally {
                // 4. Cleanup
                mapRef.current?.remove();
                onComplete();
            }
        };

        generateAndShare();
        
        return () => {
            mapRef.current?.remove();
        };

    }, [activity, onComplete]);

    const pace = activity.distanceKm > 0 ? (activity.durationSeconds / 60) / activity.distanceKm : 0;
    
    return (
        <div ref={previewRef} style={{ position: 'absolute', left: '-9999px', top: 0, width: '800px', height: '800px', backgroundColor: '#121212', fontFamily: 'Inter, sans-serif' }}>
           <div style={{ position: 'relative', width: '100%', height: '83.3%' }}>
              <div className="map-container-for-share" style={{ width: '100%', height: '100%' }}></div>
               <div style={{ position: 'absolute', top: '20px', left: '20px', backgroundColor: 'rgba(0, 0, 0, 0.6)', padding: '10px 15px', borderRadius: '12px', zIndex: 1000 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <DumbbellIconForShare />
                        <span style={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}>FitAI Coach</span>
                    </div>
                    <p style={{ color: '#E0E0E0', fontSize: '16px', marginTop: '5px' }}>
                        {new Date(activity.id).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
           </div>
           <div style={{ width: '100%', height: '16.7%', backgroundColor: '#1E1E1E', color: 'white', display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '10px', boxSizing: 'border-box' }}>
               <div style={{ textAlign: 'center' }}>
                 <p style={{ fontSize: '56px', fontWeight: 'bold', color: '#00F5D4', display: 'flex', alignItems: 'baseline', justifyContent: 'center', lineHeight: 1 }}>
                    <span>{activity.distanceKm.toFixed(2)}</span>
                    <span style={{ fontSize: '28px', color: '#A0A0A0', marginLeft: '8px', fontWeight: 'normal' }}>km</span>
                 </p>
                 <p style={{ fontSize: '18px', color: '#A0A0A0', marginTop: '8px' }}>DISTANCE</p>
               </div>
               <div style={{ textAlign: 'center' }}>
                 <p style={{ fontSize: '56px', fontWeight: 'bold', lineHeight: 1 }}>{formatTime(activity.durationSeconds)}</p>
                 <p style={{ fontSize: '18px', color: '#A0A0A0', marginTop: '8px' }}>TIME</p>
               </div>
               <div style={{ textAlign: 'center' }}>
                 <p style={{ fontSize: '56px', fontWeight: 'bold', display: 'flex', alignItems: 'baseline', justifyContent: 'center', lineHeight: 1 }}>
                    <span>{formatPace(pace)}</span>
                    <span style={{ fontSize: '28px', color: '#A0A0A0', marginLeft: '8px', fontWeight: 'normal' }}>/km</span>
                 </p>
                 <p style={{ fontSize: '18px', color: '#A0A0A0', marginTop: '8px' }}>PACE</p>
               </div>
           </div>
        </div>
    );
};


const ActivitySummaryView: React.FC<ActivitySummaryViewProps> = ({ activity, goBack, userSettings }) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = useState(false);

  useLayoutEffect(() => {
    if (mapContainerRef.current && !mapRef.current && activity?.route && activity.route.length > 0) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: false,
      }).setView([51.505, -0.09], 13);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      const latLngs = activity.route.map(p => [p.lat, p.lng] as L.LatLngTuple);
      const polyline = L.polyline(latLngs, { color: '#9B5DE5', weight: 5, opacity: 0.8 }).addTo(map);
      
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

  const handleShare = () => {
    if (!navigator.share) {
        alert("Sharing is not supported on your browser.");
        return;
    }
    setIsSharing(true);
  };
  
  const onShareComplete = () => {
    setIsSharing(false);
  };

  const calories = useMemo(() => {
    if (!activity || !userSettings.weight) {
        return null;
    }
    // Approximation for running: 1.036 kcal per kg per km.
    return Math.round(activity.distanceKm * userSettings.weight * 1.036);
  }, [activity, userSettings.weight]);

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
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto space-y-4">
        <div className="bg-dark-surface rounded-lg">
            <div 
                id="summary-map-container"
                ref={mapContainerRef} 
                className="w-full h-48 md:h-64 rounded-lg overflow-hidden"
            ></div>
        </div>
      
        <div className="bg-dark-surface p-4 rounded-lg">
            <p className="text-dark-text-secondary text-sm">{activityDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <h2 className="text-2xl font-bold text-white">{activity.name}</h2>
        </div>
        <div className="bg-dark-surface p-4 rounded-lg grid grid-cols-2 grid-rows-2 gap-4 text-center">
            <div>
                <p className="text-xs text-dark-text-secondary">DISTANCE</p>
                <p className="text-2xl font-bold text-brand-primary">{activity.distanceKm.toFixed(2)}<span className="text-lg text-dark-text-secondary ml-1">km</span></p>
            </div>
            <div>
                <p className="text-xs text-dark-text-secondary">TIME</p>
                <p className="text-2xl font-bold text-white">{formatTime(activity.durationSeconds)}</p>
            </div>
            <div>
                <p className="text-xs text-dark-text-secondary">PACE</p>
                <p className="text-2xl font-bold text-white">{formatPace(pace)}<span className="text-lg text-dark-text-secondary ml-1">/km</span></p>
            </div>
            {calories !== null && (
                 <div>
                    <p className="text-xs text-dark-text-secondary">CALORIES</p>
                    <p className="text-2xl font-bold text-white">{calories}<span className="text-lg text-dark-text-secondary ml-1">kcal</span></p>
                </div>
            )}
        </div>
         <div className="bg-dark-surface p-4 rounded-lg">
            <button
                onClick={handleShare}
                disabled={isSharing}
                className="w-full bg-brand-primary text-dark-bg font-bold py-3 rounded-md hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
            >
                {isSharing ? 'Preparing...' : <><ShareIcon className="w-5 h-5" /> Share</>}
            </button>
        </div>
      </div>
      {isSharing && activity && <SharePreview activity={activity} onComplete={onShareComplete} />}
    </div>
  );
};

export default ActivitySummaryView;