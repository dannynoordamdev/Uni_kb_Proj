import React, { useState } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import './WorldMap.css';
import { getManuscriptsByCountry } from '../services/WorldMapService'; // adjust the path if needed



const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

const WorldMap = () => {
  const [selectedISO, setSelectedISO] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [manuscripts, setManuscripts] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [hoveredISO, setHoveredISO] = useState(null);

  const handleCountryClick = async (geo) => {
    const isoCode = geo.properties.ISO_A3 ?? "";
    const countryName = geo.properties.NAME;
    console.log("Clicked country:", isoCode, countryName);
    

    setSelectedISO(isoCode);
    setSelectedCountry(countryName);
    setShowPopup(false); // Hide old popup during load

    try {
      const res = await fetch(`api/manuscripts/by-country?country=${isoCode}`);
      if (!res.ok) throw new Error("API error");

      const data = await getManuscriptsByCountry(isoCode);
      setManuscripts(data);
      setShowPopup(true); // Show after data is ready
    } catch (err) {
      console.error("Error fetching manuscripts:", err);
      setManuscripts([]);
      setShowPopup(true); // Show popup even if empty
    }
  };


  return (
    <div style={{ position: "relative" }}>
      <ComposableMap
        projection="geoEqualEarth"
        projectionConfig={{ scale: 160 }}
        width={980}
        height={500}
        style={{ width: "100%", height: "auto" }}
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const isoCode = geo.properties.ISO_A3 ?? "";
              const isSelected = selectedISO !== null && selectedISO === isoCode;
            const isHovered = hoveredISO && hoveredISO === isoCode;

              const fillColor = isSelected
                ? "#273d5a"
                : isHovered
                  ? "#a6c8ff"
                  : "#DDD";

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onClick={() => handleCountryClick(geo)}
                  onMouseEnter={() => setHoveredISO(isoCode)}
                  onMouseLeave={() => setHoveredISO(null)}
                  style={{
                    default: {
                      fill: fillColor,
                      stroke: "#FFF",
                      outline: "none"
                    },
                    hover: {
                      fill: "#a6c8ff",
                      cursor: "pointer",
                      outline: "none"
                    },
                    pressed: {
                      fill: "#273d5a",
                      outline: "none"
                    }
                  }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>
        {showPopup && (
          <div className="popup">
            <h3>Manuscripts from {selectedCountry}</h3>
            {manuscripts.length === 0 ? (
              <p>No manuscripts found.</p>
            ) : (
              <ul>
                {manuscripts.map((m) => (
                  <li key={m.id}>
                    <strong>{m.title}</strong><br />
                    {m.date} – {m.language}
                  </li>
                ))}
              </ul>
            )}
            <button onClick={() => setShowPopup(false)}>Close</button>
          </div>
        )}
    </div>
  );
};

export default WorldMap;
