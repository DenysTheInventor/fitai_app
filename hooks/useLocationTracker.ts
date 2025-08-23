import { useState, useRef, useEffect } from 'react';
import type { GPSPoint } from '../types';

// Haversine formula to calculate distance between two points in kilometers
const haversineDistance = (p1: GPSPoint, p2: GPSPoint): number => {
    const toRad = (x: number) => (x * Math.PI) / 180;
    const R = 6371; // Earth radius in km

    const dLat = toRad(p2.lat - p1.lat);
    const dLon = toRad(p2.lng - p1.lng);
    const lat1 = toRad(p1.lat);
    const lat2 = toRad(p2.lat);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

export interface TrackerStats {
    durationSeconds: number;
    distanceKm: number;
    paceMinPerKm: number; // minutes per kilometer
}

export const useLocationTracker = () => {
    const [isTracking, setIsTracking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [path, setPath] = useState<GPSPoint[][]>([[]]);
    const [stats, setStats] = useState<TrackerStats>({ durationSeconds: 0, distanceKm: 0, paceMinPerKm: 0 });
    const [error, setError] = useState<string | null>(null);

    const watchId = useRef<number | null>(null);
    const timerId = useRef<ReturnType<typeof setInterval> | null>(null);
    const lastTimestamp = useRef<number | null>(null);

    const updatePace = (distance: number, duration: number) => {
        if (distance > 0 && duration > 0) {
            const pace = (duration / 60) / distance;
            setStats(s => ({ ...s, paceMinPerKm: pace }));
        } else {
            setStats(s => ({ ...s, paceMinPerKm: 0 }));
        }
    };

    const handlePositionUpdate = (position: GeolocationPosition) => {
        const newPoint: GPSPoint = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            timestamp: position.timestamp,
            altitude: position.coords.altitude,
        };

        setPath(currentPath => {
            const lastSegment = currentPath[currentPath.length - 1];
            const lastPoint = lastSegment[lastSegment.length - 1];
            const newSegment = [...lastSegment, newPoint];
            const newFullPath = [...currentPath.slice(0, -1), newSegment];

            if (lastPoint) {
                const distanceIncrement = haversineDistance(lastPoint, newPoint);
                setStats(s => {
                    const newDistance = s.distanceKm + distanceIncrement;
                    updatePace(newDistance, s.durationSeconds);
                    return { ...s, distanceKm: newDistance };
                });
            }
            return newFullPath;
        });
    };

    const handlePositionError = (err: GeolocationPositionError) => {
        if (err.code === 1) {
            setError("Location access denied. Please enable it in your browser settings.");
        } else {
            setError(`Location error: ${err.message}`);
        }
        stopTracking(false);
    };

    const startTimer = () => {
        lastTimestamp.current = Date.now();
        timerId.current = setInterval(() => {
            const now = Date.now();
            const elapsed = (now - (lastTimestamp.current ?? now)) / 1000;
            lastTimestamp.current = now;
            setStats(s => {
                const newDuration = s.durationSeconds + elapsed;
                updatePace(s.distanceKm, newDuration);
                return { ...s, durationSeconds: newDuration };
            });
        }, 1000);
    };

    const stopTimer = () => {
        if (timerId.current) {
            clearInterval(timerId.current);
            timerId.current = null;
        }
    };

    const startTracking = () => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser.");
            return;
        }
        setError(null);
        setIsTracking(true);
        setIsPaused(false);
        setPath([[]]);
        setStats({ durationSeconds: 0, distanceKm: 0, paceMinPerKm: 0 });
        
        watchId.current = navigator.geolocation.watchPosition(handlePositionUpdate, handlePositionError, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
        });

        startTimer();
    };

    const pauseTracking = () => {
        if (watchId.current) {
            navigator.geolocation.clearWatch(watchId.current);
            watchId.current = null;
        }
        stopTimer();
        setIsPaused(true);
    };

    const resumeTracking = () => {
        // Start a new path segment
        setPath(currentPath => [...currentPath, []]);
        setIsPaused(false);
        watchId.current = navigator.geolocation.watchPosition(handlePositionUpdate, handlePositionError, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
        });
        startTimer();
    };

    const stopTracking = (reset: boolean = true) => {
        if (watchId.current) {
            navigator.geolocation.clearWatch(watchId.current);
            watchId.current = null;
        }
        stopTimer();
        setIsTracking(false);
        setIsPaused(false);
        if (reset) {
            setPath([[]]);
            setStats({ durationSeconds: 0, distanceKm: 0, paceMinPerKm: 0 });
        }
    };
    
    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
            if (timerId.current) clearInterval(timerId.current);
        };
    }, []);

    const flatPath = path.flat();

    return {
        isTracking,
        isPaused,
        path,
        flatPath,
        stats,
        error,
        startTracking,
        pauseTracking,
        resumeTracking,
        stopTracking,
    };
};
