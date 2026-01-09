import { Marker } from "../types/marker";

const globeLocations: Marker[] = [
    { name: "British Penal Colonies", lat: -33.8688, lon: 151.2093, timeline: [{ year: "1788" }] },
    { name: "Eastern State Penitentiary", lat: 39.9683, lon: -75.1727, timeline: [{ year: "1829" }] },
    { name: "Maison de Force", lat: 51.05, lon: 3.7333, timeline: [{ year: "1773" }] },
    { name: "Mesopotamia", lat: 32.4833, lon: 44.4333, timeline: [{ year: "1750 BC" }] },
    { name: "Militarized Architecture: Control, Order, and State Power", lat: 14.5995, lon: 120.9842, timeline: [{ year: "Modern" }] },
    { name: "Nazi Camps: Slavery, Terror, and Genocide", lat: 50.0274, lon: 19.202, timeline: [{ year: "1940" }] },
    { name: "Newgate Prison", lat: 51.5158, lon: -0.1018, timeline: [{ year: "1188" }] },
    { name: "Panopticon", lat: 51.5074, lon: -0.1278, timeline: [{ year: "1791" }] },
    { name: "Scandinavian Prison: Dignity, Rehabilitation, and Social Justice", lat: 59.3293, lon: 18.0686, timeline: [{ year: "Modern" }] },
    { name: "The Mamertine Prison", lat: 41.8928, lon: 12.4847, timeline: [{ year: "640 BC" }] },
    { name: "The Tower of London", lat: 51.5081, lon: -0.0759, timeline: [{ year: "1078" }] },
    { name: "London Cluster", lat: 51.5, lon: -0.1, clusterExpand: true }
];

export default globeLocations;
