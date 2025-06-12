import React, { useEffect, useState, useRef, useCallback } from "react";
import Modal from "react-modal";
import { FaExpand } from "react-icons/fa";
import "./Timeline.css";

Modal.setAppElement("#root");

const scrollToNext = () => {
  const nextSection = document.getElementById("featured");
  if (nextSection) {
    const top = nextSection.getBoundingClientRect().top + window.pageYOffset;
    window.scrollTo({
      top: top + 100,
      behavior: "smooth",
    });
  }
};

const FIELDS = [
  { label: "Shelfmark KB", key: "identifier" },
  { label: "Datum", key: "date" },
  { label: "Plaats", key: "spatial" },
  { label: "Taal", key: "language" },
  { label: "Medium", key: "medium" },
  { label: "Formaat", key: "format" },
];

const SECTION_WIDTH = window.innerWidth;
const SMOOTHING = 0.1;

function extractYear(dateStr) {
  const match = dateStr?.match(/\d{4}/);
  return match ? match[0] : null;
}

const CarouselTimelineScroll = () => {
  const [allManuscripts, setAllManuscripts] = useState([]);
  const [verluchtingenMap, setVerluchtingenMap] = useState({});
  const [verluchtingenLoading, setVerluchtingenLoading] = useState({});
  const [loading, setLoading] = useState(true);
  const [zoomImg, setZoomImg] = useState(null);
  const [visibleIndex, setVisibleIndex] = useState(0);
  const [animatedIndex, setAnimatedIndex] = useState(0);
  const [hoveredYear, setHoveredYear] = useState(null); // New state for hover preview

  const rafId = useRef(null);
  const targetIndex = useRef(0);
  const currentAnimatedIndex = useRef(0);
  const isTicking = useRef(false);
  const scrollContainerRef = useRef(null);
  const timelineBarRef = useRef(null); // Ref for the timeline bar

  useEffect(() => {
    fetch("/api/manuscripts")
      .then((res) => res.json())
      .then((data) => {
        const manuscripts = data
          .map((m) => ({ ...m, year: extractYear(m.date) }))
          .filter((m) => m.year && m.identifier)
          .sort((a, b) => parseInt(a.year) - parseInt(b.year));
        setAllManuscripts(manuscripts);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const m = allManuscripts[visibleIndex];
    if (
      !m ||
      verluchtingenMap[m.identifier] ||
      verluchtingenLoading[m.identifier]
    )
      return;

    setVerluchtingenLoading((prev) => ({ ...prev, [m.identifier]: true }));

    fetch(
      `/api/Verluchtingen/bymanuscript/${encodeURIComponent(
        m.identifier
      )}`
    )
      .then((res) => res.json())
      .then((verl) => {
        setVerluchtingenMap((prev) => ({
          ...prev,
          [m.identifier]: Array.isArray(verl) ? verl : [],
        }));
      })
      .catch(() => {
        setVerluchtingenMap((prev) => ({ ...prev, [m.identifier]: [] }));
      })
      .finally(() => {
        setVerluchtingenLoading((prev) => {
          const updated = { ...prev };
          delete updated[m.identifier];
          return updated;
        });
      });
  }, [visibleIndex, allManuscripts, verluchtingenMap, verluchtingenLoading]);

  const animateCard = useCallback(() => {
    const diff = targetIndex.current - currentAnimatedIndex.current;
    if (Math.abs(diff) < 0.01) {
      currentAnimatedIndex.current = targetIndex.current;
      setAnimatedIndex(currentAnimatedIndex.current);
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
      isTicking.current = false;
      return;
    }
    currentAnimatedIndex.current += diff * SMOOTHING;
    setAnimatedIndex(currentAnimatedIndex.current);
    rafId.current = requestAnimationFrame(animateCard);
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const onScroll = () => {
      const newIdx = Math.min(
        allManuscripts.length - 1,
        Math.max(0, Math.round(container.scrollLeft / SECTION_WIDTH))
      );

      if (newIdx !== targetIndex.current) {
        setVisibleIndex(newIdx);
        targetIndex.current = newIdx;

        if (!rafId.current) {
          rafId.current = requestAnimationFrame(animateCard);
        }
      }
    };

    container.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      container.removeEventListener("scroll", onScroll);
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [allManuscripts.length, animateCard]);

  useEffect(() => {
    setAnimatedIndex(visibleIndex);
    currentAnimatedIndex.current = visibleIndex;
    targetIndex.current = visibleIndex;
  }, [visibleIndex]);

  const handleNav = (direction) => {
    if (!scrollContainerRef.current) return;
    let newIndex = visibleIndex + direction;
    newIndex = Math.max(0, Math.min(allManuscripts.length - 1, newIndex));
    scrollContainerRef.current.scrollTo({
      left: newIndex * SECTION_WIDTH,
      behavior: "smooth",
    });
  };

  // New functions for timeline bar interaction
  const handleTimelineClick = (e) => {
    if (!timelineBarRef.current || !allManuscripts.length) return;

    const barRect = timelineBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - barRect.left; // X position relative to the bar

    const timelineBarWidth = barRect.width;
    const effectiveBarWidth =
      timelineBarWidth - timelineLeftPad - timelineRightPad;

    // Calculate the clicked percentage along the effective bar
    const clickPercentage =
      (clickX - timelineLeftPad) / effectiveBarWidth;

    // Map the percentage to an index
    const newIndex = Math.round(
      clickPercentage * (allManuscripts.length - 1)
    );

    // Ensure the index is within bounds
    const finalIndex = Math.max(
      0,
      Math.min(allManuscripts.length - 1, newIndex)
    );

    scrollContainerRef.current.scrollTo({
      left: finalIndex * SECTION_WIDTH,
      behavior: "smooth",
    });
  };

  const handleTimelineMouseMove = (e) => {
    if (!timelineBarRef.current || !allManuscripts.length) return;

    const barRect = timelineBarRef.current.getBoundingClientRect();
    const mouseX = e.clientX - barRect.left;

    const timelineBarWidth = barRect.width;
    const effectiveBarWidth =
      timelineBarWidth - timelineLeftPad - timelineRightPad;

    const mousePercentage = (mouseX - timelineLeftPad) / effectiveBarWidth;

    // Check if mouse is within the effective bar area
    if (mousePercentage >= 0 && mousePercentage <= 1) {
      const potentialIndex = Math.round(
        mousePercentage * (allManuscripts.length - 1)
      );
      const hoveredManu = allManuscripts[potentialIndex];
      setHoveredYear(hoveredManu ? hoveredManu.year : null);
    } else {
      setHoveredYear(null);
    }
  };

  const handleTimelineMouseLeave = () => {
    setHoveredYear(null);
  };

  if (loading) return <div className="carousel-loading">Laden...</div>;
  if (!allManuscripts.length)
    return <div className="carousel-loading">Geen manuscripten gevonden.</div>;

  const timelineBarWidth = 480;
  const timelineDotSize = 22;
  const timelineLeftPad = 18;
  const timelineRightPad = 18;

  // Bereken de hoogte voor de kaartencontainer
  const availableHeight = `calc(100vh - 200px)`;
  const scrollContainerHeight = `calc(100vh - 200px)`;

  return (
    <>
      <div className="carousel-outer clean">
        {/* Timeline Header */}
        <div className="timeline-header-text">Door de tijd heen</div>

        {/* Timeline Bar */}
        <div
          ref={timelineBarRef} // Assign ref
          className="timeline-bar"
          style={{ width: timelineBarWidth, height: 36 }}
          onClick={handleTimelineClick} // Add click handler
          onMouseMove={handleTimelineMouseMove} // Add mouse move handler
          onMouseLeave={handleTimelineMouseLeave} // Add mouse leave handler
        >
          <div
            className="timeline-bar-line"
            style={{ left: timelineLeftPad, right: timelineRightPad }}
          />
          {allManuscripts.map((manu, i) => {
            const isActive = Math.round(animatedIndex) === i;
            const dotLeft =
              timelineLeftPad +
              (timelineBarWidth - timelineLeftPad - timelineRightPad) *
                (i / (allManuscripts.length - 1));

            return (
              <div
                key={manu.identifier}
                className={`timeline-dot ${isActive ? "active" : ""}`}
                style={{
                  left: dotLeft,
                  width: timelineDotSize,
                  height: timelineDotSize,
                }}
              >
                {isActive && <div className="timeline-year-popup">{manu.year}</div>}
                {/* Show hovered year if it matches this dot's year and not active */}
                {!isActive && hoveredYear && manu.year === hoveredYear && (
                  <div className="timeline-year-preview">{manu.year}</div>
                )}
              </div>
            );
          })}
        </div>

        <div className="timeline-nav-buttons">
          <button
            onClick={() => handleNav(-1)}
            disabled={visibleIndex === 0}
            aria-label="Vorige"
            className="timeline-nav-btn"
          >
            &lt;
          </button>
          <button
            onClick={() => handleNav(1)}
            disabled={visibleIndex === allManuscripts.length - 1}
            aria-label="Volgende"
            className="timeline-nav-btn"
          >
            &gt;
          </button>
        </div>

        <div
          ref={scrollContainerRef}
          className="manuscript-horizontal-scroll"
          style={{ height: scrollContainerHeight }}
        >
          {allManuscripts.map((manu, i) => {
            const currentVerluchtingen = verluchtingenMap[manu.identifier] || [];
            const isLoadingVerluchtingen = verluchtingenLoading[manu.identifier];
            return (
              <section
                key={manu.identifier}
                className="carousel-center double-card"
                id={`manuscript-${i}`}
                style={{ height: availableHeight }}
              >
                {/* Kaart 1: Manuscripten */}
                <div className="carousel-card" tabIndex={0}>
                  <div className="carousel-header">
                    <span className="carousel-title">
                      {manu.title || manu.id}
                    </span>
                  </div>
                  <div className="card-content-scrollable">
                    <div className="carousel-fields">
                      {FIELDS.map(
                        (field) =>
                          manu[field.key] && (
                            <div key={field.key} className="carousel-field">
                              <span className="carousel-label">
                                {field.label}:
                              </span>
                              <span className="carousel-value">
                                {manu[field.key]}
                              </span>
                            </div>
                          )
                      )}
                    </div>
                    {manu.provenance && (
                      <div className="carousel-provenance">
                        <span className="carousel-label">Herkomst:</span>
                        <ul className="carousel-value" style={{ margin: 0, paddingLeft: "1em" }}>
                          {manu.provenance
                            .split(";")
                            .map((item, idx) =>
                              item.trim() ? (
                                <li key={idx} style={{ listStyleType: "disc" }}>
                                  {item.trim()}
                                </li>
                              ) : null
                            )}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div className="carousel-progress">
                    {i + 1} / {allManuscripts.length}
                  </div>
                </div>

                {/* Kaart 2: Verluchtingen */}
                <div className="verluchtingen-card clean">
                  <div className="verluchtingen-header">
                    <span className="verluchtingen-title">Verluchtingen</span>
                    {currentVerluchtingen.length > 1 && (
                      <span className="verluchtingen-count-pill">
                        Bevat meerdere verluchtingen
                      </span>
                    )}
                  </div>

                  <div className="verluchtingen-grid-wrapper">
                    {isLoadingVerluchtingen ? (
                      <div className="verluchtingen-empty">
                        Loading verluchtingen…
                      </div>
                    ) : currentVerluchtingen.length === 0 ? (
                      <div className="verluchtingen-empty">
                        No verluchtingen with images for this manuscript.
                      </div>
                    ) : (
                      <div className="verluchtingen-grid-container">
                        {currentVerluchtingen
                          .filter((v) => v.identifier || v.illustration)
                          .map((v, vIdx) => (
                            <div
                              key={vIdx}
                              className="verluchtingen-grid-item"
                              tabIndex={0}
                              onClick={() => setZoomImg(v.identifier || v.illustration)}
                              title="Click to zoom"
                            >
                              <div className="verluchtingen-image-wrapper">
                                <img
                                  src={v.identifier || v.illustration}
                                  alt={v.title || "Verluchting"}
                                  className="verluchtingen-grid-image"
                                  draggable={false}
                                  loading="lazy"
                                />
                                <div className="verluchtingen-zoom-indicator">
                                  <FaExpand />
                                </div>
                              </div>
                              <div className="verluchtingen-item-details">
                                <div className="verluchtingen-item-content">
                                  {v.title && (
                                    <div className="verluchtingen-item-title">
                                      {v.title}
                                    </div>
                                  )}
                                  {v.folio && (
                                    <div className="verluchtingen-item-folio">
                                      {v.folio}
                                    </div>
                                  )}
                                </div>
                                <div className="verluchtingen-item-index">
                                  {vIdx + 1}
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              </section>
            );
          })}
        </div>
         <p>Scroll horizontaal, of gebruik de navigatie knoppen om door de tijdlijn te gaan.</p>
      </div>
      {/* Modal for Zooming */}
      <Modal
        isOpen={!!zoomImg}
        onRequestClose={() => setZoomImg(null)}
        contentLabel="Verluchting Image Zoom"
        className="img-modal"
        overlayClassName="img-modal-overlay"
      >
        {zoomImg && (
          <img src={zoomImg} alt="Verluchting zoom" className="img-modal-img" />
        )}
        <button
          className="img-modal-close"
          onClick={() => setZoomImg(null)}
        >
          &times;
        </button>
      </Modal>
    </>
  );
};

export default CarouselTimelineScroll;