import dynamic from "next/dynamic";
import { useRef, useEffect, useState } from "react";
import globeLocations from "../../data/globe-locations";

// Dynamic import because react-globe.gl uses WebGL
const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

const COUNTRY = "United States";
const OPACITY = 0.22;

// Helper to parse CSV rows
function airportParse([
  airportId, name, city, country, iata, icao, lat, lng, alt, timezone, dst, tz, type, source
]) {
  return { airportId, name, city, country, iata, icao, lat, lng, alt, timezone, dst, tz, type, source };
}
function routeParse([
  airline, airlineId, srcIata, srcAirportId, dstIata, dstAirportId, codeshare, stops, equipment
]) {
  return { airline, airlineId, srcIata, srcAirportId, dstIata, dstAirportId, codeshare, stops, equipment };
}
// Utility to index an array by a key
function indexBy(arr, key) {
  const out = {};
  arr.forEach(item => { out[item[key]] = item; });
  return out;
}

export default function GlobeSection({ onMarkerClick }) {
  const globeEl = useRef();
  const [airports, setAirports] = useState([]);
  const [routes, setRoutes] = useState([]);

  // Load airports and routes from OpenFlights for demo arcs
  useEffect(() => {
    Promise.all([
      fetch("https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat").then(res => res.text())
        .then(d => d.split('\n').filter(Boolean).map(l => l.split(',')).map(airportParse)),
      fetch("https://raw.githubusercontent.com/jpatokal/openflights/master/data/routes.dat").then(res => res.text())
        .then(d => d.split('\n').filter(Boolean).map(l => l.split(',')).map(routeParse)),
    ]).then(([airports, routes]) => {
      const byIata = indexBy(airports, 'iata');
      const filteredRoutes = routes
        .filter(d => byIata[d.srcIata] && byIata[d.dstIata]) // known airports only
        .filter(d => d.stops === '0') // non-stop
        .map(d => ({
          ...d,
          srcAirport: byIata[d.srcIata],
          dstAirport: byIata[d.dstIata]
        }))
        .filter(d => d.srcAirport.country === COUNTRY && d.dstAirport.country !== COUNTRY);

      setAirports(airports.filter(a => a.country === COUNTRY && a.iata));
      setRoutes(filteredRoutes);
    });
  }, []);

  // Center the globe on the US
  useEffect(() => {
    if (globeEl.current) {
      globeEl.current.pointOfView({ lat: 39.6, lng: -98.5, altitude: 2 });
    }
  }, [airports]);

  // Disable zoom (scroll wheel / pinch) on the globe
  useEffect(() => {
    if (
      globeEl.current &&
      typeof globeEl.current.controls === "function" &&
      globeEl.current.controls()
    ) {
      globeEl.current.controls().enableZoom = false;
    }
  }, []);

  return (
    <section
      style={{
        width: "100%",
        background: "transparent",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: 0,
        paddingBottom: 0,
      }}
    >
      <div
        style={{
          width: "80vw",
          maxWidth: 900,
          minWidth: 300,
          height: "auto",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          margin: "-40px auto 0 auto", // move globe UP by 40px
          padding: 0,
          background: "transparent",
          overflow: "visible",
          position: "relative",
        }}
      >
        <Globe
          ref={globeEl}
          globeImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-night.jpg"
          // Demo arcs (airport routes)
          arcsData={routes}
          arcLabel={d => `${d.airline}: ${d.srcIata} → ${d.dstIata}`}
          arcStartLat={d => +d.srcAirport.lat}
          arcStartLng={d => +d.srcAirport.lng}
          arcEndLat={d => +d.dstAirport.lat}
          arcEndLng={d => +d.dstAirport.lng}
          arcDashLength={0.25}
          arcDashGap={1}
          arcDashInitialGap={() => Math.random()}
          arcDashAnimateTime={4000}
          arcColor={d => [`rgba(0, 255, 0, ${OPACITY})`, `rgba(255, 0, 0, ${OPACITY})`]}
          arcsTransitionDuration={0}
          // Your custom markers
          pointsData={globeLocations}
          pointLat={d => d.lat}
          pointLng={d => d.lon}
          pointColor={() => "#b32c2c"}
          pointRadius={0.65}
          onPointClick={onMarkerClick}
          pointAltitude={0.01}
          backgroundColor="rgba(0,0,0,0)"
          width={undefined}
          height={undefined}
        />
      </div>
    </section>
  );
}
