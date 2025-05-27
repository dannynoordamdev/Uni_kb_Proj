import React, { useEffect, useState, useRef, useCallback } from "react";
import Modal from "react-modal";
import { FaExpand } from "react-icons/fa";
import "./Timeline.css";
import Navbar from "./Navbar";
import Footer from "./Footer";

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
const SMOOTHING = 0.1; // Higher = smoother but slower

// --- HEIGHT CONSTANTS ---
const NAVBAR_HEIGHT = 140;
const TIMELINE_HEIGHT = 70; // Height of timeline bar + label
const CARD_MARGIN = 24; // Optional margin below cards

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
    if (!m || verluchtingenMap[m.identifier] || verluchtingenLoading[m.identifier]) return;

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

  // Listen to scroll on the container, now horizontal
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const onScroll = () => {
      const idx = Math.min(
        allManuscripts.length - 1,
        Math.max(0, Math.round(container.scrollLeft / SECTION_WIDTH))
      );
      setVisibleIndex(idx);
      targetIndex.current = idx;

      if (!isTicking.current && !rafId.current) {
        isTicking.current = true;
        rafId.current = requestAnimationFrame(animateCard);
      }
    };

    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, [allManuscripts.length]);

  const animateCard = useCallback(() => {
    const diff = targetIndex.current - currentAnimatedIndex.current;
    if (Math.abs(diff) < 0.01) {
      currentAnimatedIndex.current = targetIndex.current;
      setAnimatedIndex(currentAnimatedIndex.current);
      rafId.current = null;
      isTicking.current = false;
      return;
    }
    currentAnimatedIndex.current += diff * SMOOTHING;
    setAnimatedIndex(currentAnimatedIndex.current);
    rafId.current = requestAnimationFrame(animateCard);
  }, []);

  useEffect(() => {
    setAnimatedIndex(visibleIndex);
    currentAnimatedIndex.current = visibleIndex;
    targetIndex.current = visibleIndex;
  }, [visibleIndex]);

  if (loading) return <div className="carousel-loading">Loading…</div>;
  if (!allManuscripts.length) return <div className="carousel-loading">No manuscripts found.</div>;

  const idx = Math.floor(animatedIndex);
  const t = animatedIndex - idx;
  const m = t < 0.5 || !allManuscripts[idx + 1] ? allManuscripts[idx] : allManuscripts[idx + 1];
  const verluchtingen = (verluchtingenMap[m.identifier] || []).filter((v) => v.identifier);

  // --- Timeline Bar Calculations ---
  const timelineBarWidth = 480; // px, adjust as desired
  const timelineDotSize = 22;
  const timelineLeftPad = 18;
  const timelineRightPad = 18;

  return (
    <>
      <Navbar />
      <div className="carousel-outer clean" style={{
        width: "100vw",
        background: "#232323",
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Timeline Label */}
        <div style={{
          color: "#fff",
          fontWeight: 700,
          fontSize: "1.15rem",
          letterSpacing: "0.08em",
          marginTop: "2.2rem",
          marginBottom: 6,
          textAlign: "center"
        }}>Timeline</div>

        {/* Timeline Bar */}
        <div
          className="timeline-bar"
          style={{
            width: timelineBarWidth,
            height: 36,
            margin: "0 auto 12px auto",
            position: "relative",
            zIndex: 21,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none"
          }}
        >
          {/* Bar */}
          <div
            style={{
              position: "absolute",
              left: timelineLeftPad,
              right: timelineRightPad,
              top: "50%",
              height: 6,
              background: "#fff9",
              borderRadius: 3,
              transform: "translateY(-50%)",
              boxShadow: "0 1px 6px #0002"
            }}
          />
          {/* Dots */}
          {allManuscripts.map((manu, i) => {
            const isActive = Math.round(animatedIndex) === i;
            return (
              <div
                key={manu.identifier}
                style={{
                  position: "absolute",
                  left:
                    timelineLeftPad +
                    ((timelineBarWidth - timelineLeftPad - timelineRightPad) *
                      (i / (allManuscripts.length - 1))),
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                  width: timelineDotSize,
                  height: timelineDotSize,
                  background: isActive ? "#e17b77" : "#fff",
                  border: isActive ? "3px solid #e17b77" : "2px solid #bbb",
                  borderRadius: "50%",
                  boxShadow: isActive
                    ? "0 2px 10px #e17b7755"
                    : "0 1px 4px #0001",
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 2
                }}
              >
                {/* Show year above active dot */}
                {isActive && (
                  <div
                    style={{
                      position: "absolute",
                      top: -38,
                      left: "50%",
                      transform: "translate(-50%, 0)",
                      background: "#fff",
                      color: "#232323",
                      borderRadius: "22px",
                      padding: "4px 14px",
                      fontWeight: 700,
                      fontSize: "1.05rem",
                      boxShadow: "0 3px 12px rgba(0,0,0,0.13)",
                      opacity: 0.98,
                      pointerEvents: "none",
                      whiteSpace: "nowrap"
                    }}
                  >
                    {manu.year}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div
          ref={scrollContainerRef}
          className="manuscript-horizontal-scroll"
          style={{
            width: "100vw",
            // Subtract navbar and timeline height!
            height: `calc(100vh - ${NAVBAR_HEIGHT}px - ${TIMELINE_HEIGHT}px)`,
            overflowX: "auto",
            overflowY: "hidden",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            scrollSnapType: "x mandatory",
            scrollbarWidth: "none",
            msOverflowStyle: "none"
          }}
        >
          {allManuscripts.map((manu, i) => (
            <section
              key={manu.identifier}
              className="carousel-center double-card"
              id={`manuscript-${i}`}
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                gap: "3vw",
                background: "rgba(35,35,35,0.97)",
                borderRadius: "32px",
                padding: "2rem",
                boxShadow: "0 8px 32px #0003",
                minWidth: "100vw",
                maxWidth: "100vw",
                // Subtract navbar, timeline, and margin!
                height: `calc(100vh - ${NAVBAR_HEIGHT}px - ${TIMELINE_HEIGHT}px - ${CARD_MARGIN}px)`,
                marginRight: 0,
                scrollSnapAlign: "center"
              }}
            >
              {/* Manuscript Card */}
              <div className="carousel-card" tabIndex={0} style={{ width: "46vw", maxWidth: 700 }}>
                <div className="carousel-header">
                  <span className="carousel-title">{manu.title || manu.id}</span>
                </div>
                <div className="carousel-fields">
                  {FIELDS.map((field) => manu[field.key] && (
                    <div key={field.key} className="carousel-field">
                      <span className="carousel-label">{field.label}:</span>
                      <span className="carousel-value">{manu[field.key]}</span>
                    </div>
                  ))}
                </div>
                {manu.imageUrl && (
                  <div className="carousel-img" style={{ height: 220 }}>
                    <img src={manu.imageUrl} alt={manu.title || manu.id} />
                  </div>
                )}
                {manu.provenance && (
                  <div className="carousel-provenance">
                    <span className="carousel-label">Provenance:</span>
                    <span className="carousel-value">{manu.provenance}</span>
                  </div>
                )}
                <div className="carousel-progress">{i + 1} / {allManuscripts.length}</div>
              </div>
              {/* Verluchtingen Card */}
              <div className="verluchtingen-card clean" style={{ width: "46vw", maxWidth: 700 }}>
                <div className="verluchtingen-header">
                  <span className="verluchtingen-title">Verluchtingen</span>
                  {(verluchtingenMap[manu.identifier] || []).length > 1 && (
                    <span className="verluchtingen-count-pill">
                      {(verluchtingenMap[manu.identifier] || []).length} images
                    </span>
                  )}
                </div>
                {verluchtingenLoading[manu.identifier] ? (
                  <div className="verluchtingen-empty">Loading verluchtingen…</div>
                ) : (verluchtingenMap[manu.identifier] || []).length === 0 ? (
                  <div className="verluchtingen-empty">No verluchtingen with images for this manuscript.</div>
                ) : (
                  <div className="verluchting-vertical-scroll" style={{ maxHeight: "360px", overflowY: "auto", marginTop: "0.7rem", paddingRight: 8 }}>
                    {(verluchtingenMap[manu.identifier] || []).filter((v) => v.identifier).map((v, vIdx) => (
                      <div key={vIdx} className="verluchting-image-slide-v2" style={{ marginBottom: "1.2rem" }}>
                        <div className="verluchting-image-maxbox-v2" onClick={() => setZoomImg(v.identifier)} tabIndex={0} style={{ cursor: "zoom-in", position: "relative" }}>
                          <img src={v.identifier} alt={v.title || "Verluchting"} className="verluchting-big-img" draggable={false} />
                          <span className="img-zoom-overlay"><FaExpand /> <span>Zoom</span></span>
                        </div>
                        <div className="verluchting-image-info-v2">
                          {v.title && <div className="verluchting-image-title">{v.title}</div>}
                          {v.folio && <div className="verluchting-image-folio">{v.folio}</div>}
                          <div className="verluchting-image-progress">{vIdx + 1} / {(verluchtingenMap[manu.identifier] || []).length}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* Zoom functie */}
      <Modal
        isOpen={!!zoomImg}
        onRequestClose={() => setZoomImg(null)}
        contentLabel="Verluchting Image Zoom"
        className="img-modal"
        overlayClassName="img-modal-overlay"
      >
        {zoomImg && <img src={zoomImg} alt="Verluchting zoom" className="img-modal-img" />}
        <button className="img-modal-close" onClick={() => setZoomImg(null)}>&times;</button>
      </Modal>
      <Footer />
    </>
  );
};

export default CarouselTimelineScroll;
