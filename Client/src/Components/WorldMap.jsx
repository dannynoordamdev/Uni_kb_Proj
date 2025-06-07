import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./WorldMap.css";

const europeBounds = {
  latMin: 35,
  latMax: 72,
  lonMin: -10,
  lonMax: 40,
};

const isInEurope = (lat, lon) =>
  lat >= europeBounds.latMin &&
  lat <= europeBounds.latMax &&
  lon >= europeBounds.lonMin &&
  lon <= europeBounds.lonMax;

const getColor = (count) => {
  if (count > 20) return "#d73027";
  if (count > 10) return "#fc8d59";
  if (count > 5) return "#fee08b";
  return "#1a9850";
};

const Legend = () => (
  <div className="legend">
    <strong>Legenda (Aantal manuscripten)</strong>
    <div>
      <div className="legend-row">
        <div className="legend-dot" style={{ background: "#1a9850" }} />
        <span>1 - 5</span>
      </div>
      <div className="legend-row">
        <div className="legend-dot" style={{ background: "#fee08b" }} />
        <span>6 - 10</span>
      </div>
      <div className="legend-row">
        <div className="legend-dot" style={{ background: "#fc8d59" }} />
        <span>11 - 20</span>
      </div>
      <div className="legend-row">
        <div className="legend-dot" style={{ background: "#d73027" }} />
        <span>20+</span>
      </div>
    </div>
  </div>
);

const WorldMap = () => {
  const [manuscripten, setManuscripten] = useState([]);
  const [laden, setLaden] = useState(true);
  const [jaarStart, setJaarStart] = useState(1000);
  const [jaarEind, setJaarEind] = useState(1600);
  const [minAantal, setMinAantal] = useState(1);

  const extractJaar = (dateStr) => {
    if (!dateStr) return null;
    const match = dateStr.match(/\b(\d{4})\b/);
    return match ? match[1] : null;
  };

  useEffect(() => {
    fetch("https://api.northdev.xyz/api/manuscripts")
      .then((res) => res.json())
      .then((data) => {
        const cleaned = data
          .map((m) => ({
            ...m,
            jaar: extractJaar(m.date),
            latitude: parseFloat(m.latitude),
            longitude: parseFloat(m.longitude),
          }))
          .filter(
            (m) =>
              m.jaar &&
              m.identifier &&
              !isNaN(m.latitude) &&
              !isNaN(m.longitude)
          )
          .sort((a, b) => parseInt(a.jaar) - parseInt(b.jaar));
        setManuscripten(cleaned);
      })
      .finally(() => setLaden(false));
  }, []);

  const safeParseInt = (val, fallback) => {
    const parsed = parseInt(val);
    return isNaN(parsed) ? fallback : parsed;
  };

  const gefilterdeManuscripten = manuscripten.filter(
    (m) =>
      parseInt(m.jaar) >= jaarStart &&
      parseInt(m.jaar) <= jaarEind
  );

  const locatieTellingen = gefilterdeManuscripten.reduce((acc, m) => {
    const key = `${m.latitude.toFixed(4)},${m.longitude.toFixed(4)}`;
    if (!acc[key]) acc[key] = { lat: m.latitude, lon: m.longitude, aantal: 0 };
    acc[key].aantal += 1;
    return acc;
  }, {});

  const buitenEuropaAantal = gefilterdeManuscripten.filter(
    (m) => !isInEurope(m.latitude, m.longitude)
  ).length;

  if (laden) return <div style={{ textAlign: "center", marginTop: 100, fontSize: "1.3rem", color: "#666" }}>Manuscripten laden...</div>;

  return (
    <div id="worldmap-container">

    <div className="worldmap-layout">
      <div className="map-section">
        <h2 className="map-title">Verdeling van middeleeuwse manuscripten in Europa</h2>
        <MapContainer
          center={[52, 10]}
          zoom={5}
          scrollWheelZoom={true}
          className="leaflet-map"
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {Object.values(locatieTellingen)
            .filter(({ lat, lon, aantal }) => isInEurope(lat, lon) && aantal >= minAantal)
            .map(({ lat, lon, aantal }) => (
              <CircleMarker
                key={`${lat}-${lon}`}
                center={[lat, lon]}
                radius={5 + Math.min(aantal, 10)}
                fillColor={getColor(aantal)}
                color={getColor(aantal)}
                fillOpacity={0.7}
                stroke={false}
              >
                <Tooltip direction="top" offset={[0, -10]} opacity={0.9}>
                  <span>{`Aantal manuscripten: ${aantal}`}</span>
                </Tooltip>
              </CircleMarker>
            ))}
        </MapContainer>
      </div>
      <div className="sidebar">
        <div className="filters">
          <h3>Filters</h3>
          <div className="filter-row">
            <label htmlFor="jaarStart">Jaar (van):</label>
            <input
              type="number"
              id="jaarStart"
              value={jaarStart}
              onChange={(e) => setJaarStart(safeParseInt(e.target.value, jaarStart))}
              min={800}
              max={jaarEind}
            />
            <label htmlFor="jaarEind">t/m</label>
            <input
              type="number"
              id="jaarEind"
              value={jaarEind}
              onChange={(e) => setJaarEind(safeParseInt(e.target.value, jaarEind))}
              min={jaarStart}
              max={2000}
            />
          </div>
          <div className="filter-row">
            <label htmlFor="minAantal">Minimaal aantal per locatie:</label>
            <input
              type="number"
              id="minAantal"
              value={minAantal}
              onChange={(e) => setMinAantal(safeParseInt(e.target.value, minAantal))}
              min={1}
            />
          </div>
        </div>
        <div className="sidebar-section">
          <div className="buiten-europa">
            Manuscripten buiten Europa: <span>{buitenEuropaAantal}</span>
          </div>
          <Legend />
        </div>
      </div>
    </div>
    </div>
  );
};

export default WorldMap;
