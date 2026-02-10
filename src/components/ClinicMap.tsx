import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons for Leaflet + bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface ClinicMarker {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

interface ClinicMapProps {
  clinics: ClinicMarker[];
}

export default function ClinicMap({ clinics }: ClinicMapProps) {
  const center: [number, number] =
    clinics.length > 0
      ? [clinics[0].latitude, clinics[0].longitude]
      : [-1.2921, 36.8219]; // Default: Nairobi

  return (
    <MapContainer
      center={center}
      zoom={12}
      scrollWheelZoom={false}
      className="h-full w-full rounded-2xl z-0"
      style={{ minHeight: "10rem" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {clinics.map((c) => (
        <Marker key={c.id} position={[c.latitude, c.longitude]}>
          <Popup>
            <strong className="text-sm">{c.name}</strong>
            <br />
            <span className="text-xs text-muted-foreground">{c.address}</span>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
