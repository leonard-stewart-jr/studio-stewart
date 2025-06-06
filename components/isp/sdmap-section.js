import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import sdEvents from "../../data/sd-events";
import L from "leaflet";
import React from "react";

const MAPBOX_TOKEN = "pk.eyJ1IjoibGVvbmFyZHN0ZXdhcnQiLCJhIjoiY21ibDkyZjhhMGtxdDJ3b2tjbXIxc3Y0NyJ9.4k_QUb2n_fZIOB3-anEs_Q";

// Custom hollow circle icon (red)
const markerIcon = new L.DivIcon({
  className: 'custom-marker',
  html: `<div style="width:18px;height:18px;border:3px solid #b32c2c;border-radius:50%;background:transparent;"></div>`
});

// Helper component for programmatic zoom
function ZoomToMarker({ position, zoom }) {
  const map = useMap();
  if (position && zoom) {
    map.setView(position, zoom, { animate: true });
  }
  return null;
}

export default function SDMapSection({ onMarkerClick }) {
  const [zoomMarker, setZoomMarker] = React.useState(null);

  return (
    <section style={{
      width: "100%",
      background: "transparent",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      paddingTop: 32,
      paddingBottom: 0,
    }}>
      <h2 style={{
        color: "#222",
        fontSize: 28,
        marginBottom: 16,
        marginTop: 0,
        fontWeight: 600,
        letterSpacing: "0.03em",
      }}>
        South Dakota: Timeline of Events
      </h2>
      <div style={{
        width: "90vw",
        maxWidth: 600,
        minWidth: 300,
        aspectRatio: "1 / 1",
        height: "auto",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}>
        <MapContainer
          center={[44.5, -100.0]}
          zoom={7}
          style={{ height: "100%", width: "100%", minHeight: 300, minWidth: 300 }}
          zoomControl={false}
          scrollWheelZoom={false}
          doubleClickZoom={false}
          dragging={true}
          attributionControl={true}
          whenCreated={map => { map._allowZoom = false; }}
        >
          <TileLayer
            url={`https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}`}
            attribution='&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            tileSize={512}
            zoomOffset={-1}
          />
          {sdEvents.map((ev, idx) => (
            <Marker
              key={idx}
              position={[ev.lat, ev.lon]}
              icon={markerIcon}
              eventHandlers={{
                click: () => {
                  setZoomMarker({ position: [ev.lat, ev.lon], zoom: 10 });
                  onMarkerClick(ev);
                },
              }}
            >
              <Popup>{ev.year}, {ev.name}</Popup>
            </Marker>
          ))}
          {zoomMarker && <ZoomToMarker position={zoomMarker.position} zoom={zoomMarker.zoom} />}
        </MapContainer>
      </div>
    </section>
  );
}
