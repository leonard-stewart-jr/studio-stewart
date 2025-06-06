import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import usaLocations from "../../data/usa-locations";
import L from "leaflet";

// Custom hollow circle icon
const markerIcon = new L.DivIcon({
  className: 'custom-marker',
  html: `<div style="width:18px;height:18px;border:3px solid #b32c2c;border-radius:50%;background:transparent;"></div>`
});

export default function USAMapSection({ onMarkerClick }) {
  return (
    <section style={{ width: "100%", minHeight: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f3f4fa" }}>
      <h2 style={{ color: "#222", fontSize: 28 }}>United States: Major Prison Events</h2>
      <div style={{ width: "80vw", maxWidth: 900, height: 400 }}>
        <MapContainer center={[39.8283, -98.5795]} zoom={4} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          {usaLocations.map((loc, idx) => (
            <Marker
              key={idx}
              position={[loc.lat, loc.lon]}
              icon={markerIcon}
              eventHandlers={{
                click: () => onMarkerClick(loc),
              }}
            >
              <Popup>{loc.name}</Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </section>
  );
}
