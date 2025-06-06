import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import sdEvents from "../../data/sd-events";
import L from "leaflet";

// Custom hollow circle icon
const markerIcon = new L.DivIcon({
  className: 'custom-marker',
  html: `<div style="width:18px;height:18px;border:3px solid #35396e;border-radius:50%;background:transparent;"></div>`
});

export default function SDMapSection({ onMarkerClick }) {
  return (
    <section style={{ width: "100%", minHeight: "80vh", position: "relative", background: "#111", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <h2 style={{ color: "#fff", fontSize: 28, marginBottom: 24 }}>South Dakota: Timeline of Events</h2>
      <div style={{ width: "80vw", maxWidth: 900, height: 400 }}>
        <MapContainer center={[44.5, -100.0]} zoom={7} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          {sdEvents.map((ev, idx) => (
            <Marker
              key={idx}
              position={[ev.lat, ev.lon]}
              icon={markerIcon}
              eventHandlers={{
                click: () => onMarkerClick(ev),
              }}
            >
              <Popup>{ev.year}, {ev.name}</Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </section>
  );
}
