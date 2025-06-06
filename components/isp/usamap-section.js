import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useRef } from "react";
import "leaflet/dist/leaflet.css";
import usaLocations from "../../data/usa-locations";
import L from "leaflet";
import React from "react";

const MAPBOX_TOKEN = "pk.eyJ1IjoibGVvbmFyZHN0ZXdhcnQiLCJhIjoiY21ibDkyZjhhMGtxdDJ3b2tjbXIxc3Y0NyJ9.4k_QUb2n_fZIOB3-anEs_Q";

// Custom hollow circle icon
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

export default function USAMapSection({ onMarkerClick }) {
  const [zoomMarker, setZoomMarker] = React.useState(null);

  return (
    <section style={{
      width: "100%",
      background: "transparent",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      paddingTop: 0,
      paddingBottom: 0,
    }}>
      <div style={{
        width: "90vw",
        maxWidth: 600,
        minWidth: 300,
        aspectRatio: "1 / 1",
        height: "auto",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        margin: "18px auto 0 auto", // shift map up
      }}>
        <MapContainer
          center={[39.8283, -98.5795]}
          zoom={4}
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
          {usaLocations.map((loc, idx) => (
            <Marker
              key={idx}
              position={[loc.lat, loc.lon]}
              icon={markerIcon}
              eventHandlers={{
                click: () => {
                  setZoomMarker({ position: [loc.lat, loc.lon], zoom: 10 });
                  onMarkerClick(loc);
                },
              }}
            >
              <Popup>{loc.name}</Popup>
            </Marker>
          ))}
          {zoomMarker && <ZoomToMarker position={zoomMarker.position} zoom={zoomMarker.zoom} />}
        </MapContainer>
      </div>
    </section>
  );
}
