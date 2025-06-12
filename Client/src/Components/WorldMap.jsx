import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import Modal from "react-modal";
import { FaExpand } from "react-icons/fa";
import "leaflet/dist/leaflet.css";
import "./WorldMap.css";

Modal.setAppElement("#root");

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

function SmallLegend() {
  return (
    <div className="small-legend">
      <div className="legend-item">
        <span className="legend-dot" style={{ background: "#1a9850" }} />
        <span>1-5</span>
      </div>
      <div className="legend-item">
        <span className="legend-dot" style={{ background: "#fee08b" }} />
        <span>6-10</span>
      </div>
      <div className="legend-item">
        <span className="legend-dot" style={{ background: "#fc8d59" }} />
        <span>11-20</span>
      </div>
      <div className="legend-item">
        <span className="legend-dot" style={{ background: "#d73027" }} />
        <span>20+</span>
      </div>
    </div>
  );
}

const WorldMap = () => {
  const [manuscripten, setManuscripten] = useState([]);
  const [laden, setLaden] = useState(true);
  const [selectedLocationKey, setSelectedLocationKey] = useState(null);
  const [selectedManuscriptId, setSelectedManuscriptId] = useState(null);
  const [verluchtingen, setVerluchtingen] = useState({});
  const [verluchtingenLoading, setVerluchtingenLoading] = useState({});
  const [zoomImg, setZoomImg] = useState(null);

  const extractJaar = (dateStr) => {
    if (!dateStr) return null;
    const match = dateStr.match(/\b(\d{4})\b/);
    return match ? match[1] : null;
  };

  useEffect(() => {
    fetch("/api/manuscripts")
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

  const locationGroups = manuscripten.reduce((acc, m) => {
    const key = `${m.latitude.toFixed(4)},${m.longitude.toFixed(4)}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});

  const locatieTellingen = Object.entries(locationGroups).map(([key, group]) => {
    const [lat, lon] = key.split(",").map(Number);
    return { key, lat, lon, aantal: group.length };
  });

  const selectedManuscripts =
    selectedLocationKey && locationGroups[selectedLocationKey]
      ? locationGroups[selectedLocationKey]
      : [];

  useEffect(() => {
    selectedManuscripts.forEach((m) => {
      if (
        !verluchtingen[m.identifier] &&
        !verluchtingenLoading[m.identifier]
      ) {
        setVerluchtingenLoading((prev) => ({
          ...prev,
          [m.identifier]: true,
        }));
        fetch(
          `/api/Verluchtingen/bymanuscript/${encodeURIComponent(
            m.identifier
          )}`
        )
          .then((res) => res.json())
          .then((verl) => {
            setVerluchtingen((prev) => ({
              ...prev,
              [m.identifier]: Array.isArray(verl) ? verl : [],
            }));
          })
          .catch(() => {
            setVerluchtingen((prev) => ({ ...prev, [m.identifier]: [] }));
          })
          .finally(() => {
            setVerluchtingenLoading((prev) => {
              const updated = { ...prev };
              delete updated[m.identifier];
              return updated;
            });
          });
      }
    });
  }, [selectedManuscripts, verluchtingen, verluchtingenLoading]);

  if (laden)
    return (
      <div className="loading">Manuscripten laden...</div>
    );

  const manuscriptsWithImages = selectedManuscripts.filter(m =>
    verluchtingen[m.identifier] && verluchtingen[m.identifier].length > 0
  );

  return (
    <div id="worldmap-container">
      <div className="worldmap-layout two-columns">
        <div className="map-section">
          <h2 className="map-title">Middeleeuwse manuscripten in Europa</h2>
          <div className="map-outer-wrap">
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
              {locatieTellingen
                .filter(({ lat, lon }) => isInEurope(lat, lon))
                .map(({ key, lat, lon, aantal }) => (
                  <CircleMarker
                    key={key}
                    center={[lat, lon]}
                    radius={8 + Math.min(aantal, 14)}
                    fillColor={getColor(aantal)}
                    color={selectedLocationKey === key ? "#0078d7" : getColor(aantal)}
                    fillOpacity={0.8}
                    stroke={selectedLocationKey === key}
                    weight={selectedLocationKey === key ? 3 : 0}
                    eventHandlers={{
                      click: () => setSelectedLocationKey(key),
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <Tooltip direction="top" offset={[0, -10]} opacity={0.95}>
                      <span>{`Aantal manuscripten: ${aantal}`}</span>
                    </Tooltip>
                  </CircleMarker>
                ))}
            </MapContainer>
            <SmallLegend />
          </div>
        </div>
        <div className="sidebar selected-sidebar modern">
          <h3>Manuscripten op geselecteerde locatie</h3>
          {selectedLocationKey && selectedManuscripts.length === 0 && !laden ? (
            <div className="empty-message">
              Geen manuscripten gevonden op deze locatie.
            </div>
          ) : (
            <div className="manuscript-list">
              {manuscriptsWithImages.length === 0 && !laden ? (
                 <div className="empty-message">
                 Geen manuscripten met afbeeldingen gevonden op deze locatie.
               </div>
              ) : (
                manuscriptsWithImages.map((m) => {
                  const verl = verluchtingen[m.identifier] || [];
                  const loading = verluchtingenLoading[m.identifier];
                  return (
                    <div
                      key={m.identifier}
                      className={`selected-manuscript-card modern${selectedManuscriptId === m.identifier ? " selected" : ""}`}
                      onClick={() => setSelectedManuscriptId(m.identifier)}
                    >
                      <div className="manuscript-card-header">
                        <strong>{m.title || "Onbekende titel"}</strong>
                        <span className="manuscript-year">{m.jaar}</span>
                      </div>
                      <div className="manuscript-info-row">
                        <span>ID: {m.identifier}</span>
                        <span>
                          Locatie: {m.latitude.toFixed(2)}, {m.longitude.toFixed(2)}
                        </span>
                      </div>
                      <div className="verluchtingen-grid modern">
                        {loading ? (
                          <div className="verluchting-loading">Verluchtingen laden…</div>
                        ) : (
                          verl.slice(0, 3).map((v, idx) => (
                            <div
                              className="verluchting-thumb modern"
                              key={idx}
                              onClick={(e) => {
                                e.stopPropagation();
                                setZoomImg(v.identifier || v.illustration);
                              }}
                              title="Klik om te vergroten"
                            >
                              <img
                                src={v.identifier || v.illustration}
                                alt={v.title || "Verluchting"}
                                className="verluchting-img modern"
                                loading="lazy"
                              />
                              <div className="verluchting-zoom">
                                <FaExpand />
                              </div>
                              {v.folio && (
                                <div className="verluchting-folio modern">{v.folio}</div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
      <Modal
        isOpen={!!zoomImg}
        onRequestClose={() => setZoomImg(null)}
        contentLabel="Verluchting Zoom"
        className="verluchting-modal"
        overlayClassName="verluchting-modal-overlay"
      >
        <button className="verluchting-modal-close" onClick={() => setZoomImg(null)}>
          &times;
        </button>
        {zoomImg && (
          <img src={zoomImg} alt="Verluchting zoom" className="verluchting-modal-img" />
        )}
      </Modal>
    </div>
  );
};

export default WorldMap;
