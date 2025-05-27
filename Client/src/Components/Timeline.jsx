import React, { useEffect, useState, useRef, useCallback } from "react";
import Modal from "react-modal";
import { FaExpand } from "react-icons/fa";
import "./Timeline.css"; // Zorg ervoor dat je de bijgewerkte CSS gebruikt

Modal.setAppElement("#root");

const FIELDS = [
  { label: "Shelfmark", key: "identifier" },
  { label: "Date", key: "date" },
  { label: "Place", key: "spatial" },
  { label: "Language", key: "language" },
  { label: "Medium", key: "medium" },
  { label: "Format", key: "format" },
];

const SECTION_WIDTH = window.innerWidth;
const SMOOTHING = 0.1;

const NAVBAR_HEIGHT = 140;
const TIMELINE_HEIGHT = 70;
const CARD_MARGIN_BOTTOM = 24; // Marge onder de kaarten

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

  const rafId = useRef(null);
  const targetIndex = useRef(0);
  const currentAnimatedIndex = useRef(0);
  const isTicking = useRef(false);
  const scrollContainerRef = useRef(null);

  // --- Data Fetching ---
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

    fetch(`/api/Verluchtingen/bymanuscript/${encodeURIComponent(m.identifier)}`)
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

  // --- Animation & Scrolling Logic ---
  const animateCard = useCallback(() => {
      const diff = targetIndex.current - currentAnimatedIndex.current;
      if (Math.abs(diff) < 0.01) {
        currentAnimatedIndex.current = targetIndex.current;
        setAnimatedIndex(currentAnimatedIndex.current);
        cancelAnimationFrame(rafId.current); // Use cancelAnimationFrame
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

      // Only update if index actually changes
      if (newIdx !== targetIndex.current) {
         setVisibleIndex(newIdx); // Update visibleIndex for data fetching
         targetIndex.current = newIdx; // Set target for animation

         if (!rafId.current) { // Start animation only if not running
            rafId.current = requestAnimationFrame(animateCard);
         }
      }
    };

    container.addEventListener("scroll", onScroll, { passive: true });
    return () => {
       container.removeEventListener("scroll", onScroll);
       if (rafId.current) {
           cancelAnimationFrame(rafId.current); // Clean up animation frame
       }
    };
  }, [allManuscripts.length, animateCard]); // Only depend on these


  useEffect(() => {
    // This effect ensures the initial state and snaps match
    setAnimatedIndex(visibleIndex);
    currentAnimatedIndex.current = visibleIndex;
    targetIndex.current = visibleIndex;
  }, [visibleIndex]);


  // --- Render Logic ---
  if (loading) return <div className="carousel-loading">Laden...</div>;
  if (!allManuscripts.length)
    return <div className="carousel-loading">Geen manuscripten gevonden.</div>;

  const timelineBarWidth = 480;
  const timelineDotSize = 22;
  const timelineLeftPad = 18;
  const timelineRightPad = 18;

  // Bereken de hoogte voor de kaartencontainer
  const availableHeight = `calc(100vh - ${NAVBAR_HEIGHT}px - ${TIMELINE_HEIGHT}px - ${CARD_MARGIN_BOTTOM}px)`;
  const scrollContainerHeight = `calc(100vh - ${NAVBAR_HEIGHT}px - ${TIMELINE_HEIGHT}px)`;

  return (
    <>
      <div className="carousel-outer clean">
        {/* Timeline Header */}
        <div className="timeline-header-text">Tijdlijn</div>

        {/* Timeline Bar */}
        <div
          className="timeline-bar"
          style={{ width: timelineBarWidth, height: 36 }}
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
              </div>
            );
          })}
        </div>

        {/* Horizontal Scroll Container */}
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
                style={{ height: availableHeight }} // Set height here
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
                        <span className="carousel-label">Provenance:</span>
                        <span className="carousel-value">
                          {manu.provenance}
                        </span>
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
                            {currentVerluchtingen.length} images
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
                                .filter((v) => v.identifier)
                                .map((v, vIdx) => (
                                    <div
                                    key={vIdx}
                                    className="verluchtingen-grid-item"
                                    tabIndex={0}
                                    onClick={() => setZoomImg(v.identifier)}
                                    title="Click to zoom"
                                    >
                                    <div className="verluchtingen-image-wrapper">
                                        <img
                                        src={v.identifier}
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