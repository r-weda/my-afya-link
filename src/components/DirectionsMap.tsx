import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Loader2, LocateFixed } from "lucide-react";

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const userIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  className: "hue-rotate-[200deg] saturate-150",
});

interface DirectionsMapProps {
  clinicName: string;
  clinicLat: number;
  clinicLng: number;
}

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length >= 2) {
      const bounds = L.latLngBounds(points.map(([lat, lng]) => [lat, lng]));
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [points, map]);
  return null;
}

export default function DirectionsMap({ clinicName, clinicLat, clinicLng }: DirectionsMapProps) {
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [route, setRoute] = useState<[number, number][]>([]);
  const [distance, setDistance] = useState<string>("");
  const [duration, setDuration] = useState<string>("");
  const [locating, setLocating] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserPos(coords);
        setLocating(false);
        fetchRoute(coords, [clinicLat, clinicLng]);
      },
      () => {
        setError("Unable to get your location. Please enable location access.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [clinicLat, clinicLng]);

  const fetchRoute = async (from: [number, number], to: [number, number]) => {
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.routes && data.routes.length > 0) {
        const r = data.routes[0];
        const coords: [number, number][] = r.geometry.coordinates.map(
          ([lng, lat]: [number, number]) => [lat, lng] as [number, number]
        );
        setRoute(coords);

        const km = (r.distance / 1000).toFixed(1);
        setDistance(`${km} km`);

        const mins = Math.round(r.duration / 60);
        if (mins >= 60) {
          const hrs = Math.floor(mins / 60);
          const rem = mins % 60;
          setDuration(`${hrs}h ${rem}m`);
        } else {
          setDuration(`${mins} min`);
        }
      }
    } catch {
      // Route fetch failed silently — map still shows markers
    }
  };

  if (locating) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-2 bg-secondary/30 rounded-2xl">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground">Getting your location…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-2 bg-secondary/30 rounded-2xl px-4">
        <LocateFixed className="w-5 h-5 text-muted-foreground" />
        <p className="text-xs text-muted-foreground text-center">{error}</p>
      </div>
    );
  }

  const center: [number, number] = userPos || [clinicLat, clinicLng];
  const fitPoints: [number, number][] = userPos
    ? [userPos, [clinicLat, clinicLng]]
    : [[clinicLat, clinicLng]];

  return (
    <div className="relative h-full">
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={false}
        className="h-full w-full rounded-2xl z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds points={fitPoints} />

        {/* User marker */}
        {userPos && (
          <Marker position={userPos} icon={userIcon}>
            <Popup><strong className="text-sm">Your Location</strong></Popup>
          </Marker>
        )}

        {/* Clinic marker */}
        <Marker position={[clinicLat, clinicLng]}>
          <Popup><strong className="text-sm">{clinicName}</strong></Popup>
        </Marker>

        {/* Route line */}
        {route.length > 0 && (
          <Polyline
            positions={route}
            pathOptions={{ color: "hsl(142, 71%, 45%)", weight: 4, opacity: 0.8 }}
          />
        )}
      </MapContainer>

      {/* Distance/duration badge */}
      {(distance || duration) && (
        <div className="absolute bottom-3 left-3 z-[1000] bg-background/90 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg border border-border/50">
          <div className="flex items-center gap-3 text-xs font-medium">
            {distance && <span className="text-foreground">{distance}</span>}
            {duration && <span className="text-primary">{duration}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
