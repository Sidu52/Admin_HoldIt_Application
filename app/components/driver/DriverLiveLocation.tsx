"use client";

import { useEffect, useState, useRef } from "react";
import { socket } from "@/app/lib/socket";
import { FaMapMarkerAlt, FaLocationArrow, FaSatellite, FaCompass } from "react-icons/fa";
import { formatCoord } from "@/app/utils/location";

interface LiveLocationProps {
  driverId: string;
  initialLocation?: {
    coordinates?: number[];
    address?: string;
  };
}

interface LocationUpdate {
  lat: number;
  lng: number;
  speed?: number;
  heading?: number;
  updatedAt?: string | number;
  bookingId?: string;
}

export default function DriverLiveLocation({ driverId, initialLocation }: LiveLocationProps) {
  const [currentLoc, setCurrentLoc] = useState<LocationUpdate | null>(() => {
    if (initialLocation?.coordinates?.[1] && initialLocation?.coordinates?.[0]) {
      return {
        lat: initialLocation.coordinates[1],
        lng: initialLocation.coordinates[0],
        updatedAt: Date.now(),
      };
    }
    return null;
  });

  const [history, setHistory] = useState<{ lat: number; lng: number; time: number }[]>([]);
  const [status, setStatus] = useState<"connecting" | "tracking" | "offline">("connecting");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // 1. Listen for socket updates
  useEffect(() => {
    // Join the admin room to receive global updates or specific updates
    socket.emit("admin:join", { room: "admin:dashboard" });

    const handleLocationUpdate = (payload: any) => {
      // payload structure: { driverId, bookingId, lat, lng, updatedAt, speed, heading }
      if (payload && payload.driverId === driverId) {
        const update: LocationUpdate = {
          lat: payload.lat,
          lng: payload.lng,
          speed: payload.speed,
          heading: payload.heading,
          updatedAt: payload.updatedAt || Date.now(),
          bookingId: payload.bookingId,
        };
        setCurrentLoc(update);
        setStatus("tracking");
        setHistory((prev) => [...prev, { lat: payload.lat, lng: payload.lng, time: Date.now() }]);
      }
    };

    const handleStaleLocation = (payload: any) => {
      if (payload && payload.driverId === driverId) {
        setStatus("offline");
      }
    };

    socket.on("driver:location:updated", handleLocationUpdate);
    socket.on("driver:location:stale", handleStaleLocation);

    // Initial check: if we have initial coordinates, mark status as tracking
    if (initialLocation?.coordinates?.[1] && initialLocation?.coordinates?.[0]) {
      setStatus("tracking");
    }

    return () => {
      socket.off("driver:location:updated", handleLocationUpdate);
      socket.off("driver:location:stale", handleStaleLocation);
    };
  }, [driverId, initialLocation]);

  // 2. Update Map Iframe (OpenStreetMap via Leaflet embedded HTML)
  useEffect(() => {
    if (!currentLoc || !iframeRef.current) return;

    const mapHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          html, body, #map { height: 100%; margin: 0; padding: 0; background: #111827; }
          .leaflet-bar a { background-color: #1f2937 !important; color: #f3f4f6 !important; border-color: #374151 !important; }
          .leaflet-bar a:hover { background-color: #374151 !important; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          const map = L.map('map', { zoomControl: false }).setView([${currentLoc.lat}, ${currentLoc.lng}], 16);
          L.control.zoom({ position: 'topright' }).addTo(map);

          // Premium Dark Mode Tiles
          L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap &copy; CARTO'
          }).addTo(map);

          // Premium custom pulse icon for live tracking
          const pulseIcon = L.divIcon({
            className: 'custom-div-icon',
            html: \`
              <div style="position: relative; width: 30px; height: 30px;">
                <div style="position: absolute; top: 5px; left: 5px; width: 20px; height: 20px; background: #3b82f6; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 0 10px rgba(59, 130, 246, 0.8); z-index: 2;"></div>
                <div style="position: absolute; top: 0px; left: 0px; width: 30px; height: 30px; background: rgba(59, 130, 246, 0.4); border-radius: 50%; animation: pulse 1.5s infinite ease-out; z-index: 1;"></div>
              </div>
              <style>
                @keyframes pulse {
                  0% { transform: scale(0.5); opacity: 1; }
                  100% { transform: scale(1.8); opacity: 0; }
                }
              </style>
            \`,
            iconSize: [30, 30],
            iconAnchor: [15, 15]
          });

          const marker = L.marker([${currentLoc.lat}, ${currentLoc.lng}], { icon: pulseIcon }).addTo(map);

          // Add popup
          marker.bindPopup("<div style='color:#000;font-family:sans-serif;font-size:12px;font-weight:bold;'>Driver Live Location</div>").openPopup();

          // Update position function called from parent window if needed, or simply let iframe reload/redraw
          window.updatePosition = (lat, lng) => {
            const newLatLng = new L.LatLng(lat, lng);
            marker.setLatLng(newLatLng);
            map.panTo(newLatLng);
          };
        </script>
      </body>
      </html>
    `;

    const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(mapHtml);
      doc.close();
    }
  }, [currentLoc?.lat, currentLoc?.lng]);

  const hasCoords = currentLoc?.lat !== undefined && currentLoc?.lng !== undefined;

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-280px)] min-h-[450px]">
      {/* Sidebar Stats & Status */}
      <div className="w-full lg:w-80 flex flex-col gap-5 shrink-0">
        <div className="bg-white dark:bg-[#232f48] border border-slate-100 dark:border-[#324467] rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
            <FaCompass className="text-primary text-base" />
            Tracking Status
          </h3>

          <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-xl mb-4">
            <div className={`h-3.5 w-3.5 rounded-full ${
              status === "tracking" ? "bg-emerald-500 animate-pulse" :
              status === "connecting" ? "bg-amber-500" : "bg-rose-500"
            }`} />
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white capitalize">
                {status === "tracking" ? "Live Tracking Active" : status === "connecting" ? "Awaiting Socket Signals" : "Driver Offline"}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                {status === "tracking" ? "Receiving real-time coordinates" : "Listening on driver:location:updated"}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Latitude</span>
              <p className="text-sm font-semibold text-slate-900 dark:text-white font-mono mt-0.5">
                {hasCoords ? formatCoord(currentLoc!.lat, "lat") : "—"}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Longitude</span>
              <p className="text-sm font-semibold text-slate-900 dark:text-white font-mono mt-0.5">
                {hasCoords ? formatCoord(currentLoc!.lng, "lng") : "—"}
              </p>
            </div>
            {currentLoc?.speed !== undefined && (
              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Speed</span>
                <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                  {currentLoc.speed.toFixed(1)} km/h
                </p>
              </div>
            )}
            {currentLoc?.updatedAt && (
              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Last Signal</span>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                  {new Date(currentLoc.updatedAt).toLocaleTimeString()}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action / Help box */}
        <div className="bg-blue-500/5 border border-blue-500/15 rounded-2xl p-5">
          <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <FaSatellite />
            Telemetry Information
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Live updates are received directly from the driver's mobile app via Socket.io. Tracking activates automatically when the driver is assigned to an active booking.
          </p>
        </div>
      </div>

      {/* Map View */}
      <div className="flex-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden relative shadow-inner">
        {hasCoords ? (
          <iframe
            ref={iframeRef}
            className="w-full h-full border-0"
            title="Driver Live Tracking Map"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-slate-50 dark:bg-[#1a2332]/40">
            <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 mb-4 shadow-sm">
              <FaMapMarkerAlt className="text-2xl animate-bounce" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">No Location Stream Yet</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
              Waiting for the driver's device to transmit live GPS coordinates. Make sure the driver is online.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
