import React, { useEffect, useState, useRef, useCallback } from "react";
import Modal from "react-modal";
import { FaExpand } from "react-icons/fa";
import "./CarouselTimeline.css";
import Navbar from "./Navbar";

Modal.setAppElement("#root");

function extractYear(dateStr) {
  if (!dateStr) return null;
  const match = dateStr.match(/\d{4}/);
  return match ? match[0] : null;
}

const FIELDS = [
  { label: "Shelfmark", key: "identifier" },
  { label: "Date", key: "date" },
  { label: "Place", key: "spatial" },
  { label: "Language", key: "language" },
  { label: "Medium", key: "medium" },
  { label: "Format", key: "format" },
];

const SECTION_HEIGHT = 600; // px per manuscript
const SMOOTHING = 0.9; // lower = smoother/slower

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

  useEffect(() => {
    setLoading(true);
    fetch("/api/manuscripts")
      .then((res) => res.json())
      .then((data) => {
        const withYear = data
          .map((m) => ({ ...m, year: extractYear(m.date) }))
          .filter((m) => m.year && m.identifier);
        withYear.sort((a, b) => parseInt(a.year) - parseInt(b.year));
        setAllManuscripts(withYear);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!allManuscripts.length) return;
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
        setVerluchtingenLoading((prev) => {
          const copy = { ...prev };
          delete copy[m.identifier];
          return copy;
        });
      })
      .catch(() => {
        setVerluchtingenMap((prev) => ({ ...prev, [m.identifier]: [] }));
        setVerluchtingenLoading((prev) => {
          const copy = { ...prev };
          delete copy[m.identifier];
          return copy;
        });
      });
  }, [allManuscripts, visibleIndex, verluchtingenMap, verluchtingenLoading]);

  useEffect(() => {
    if (!allManuscripts.length) return;

    const onScroll = () => {
      const scrollY = window.scrollY;
      const idx = Math.min(
        allManuscripts.length - 1,
        Math.max(0, Math.round(scrollY / SECTION_HEIGHT))
      );
      setVisibleIndex(idx);
      targetIndex.current = idx;
      if (!isTicking.current && rafId.current == null) {
        isTicking.current = true;
        rafId.current = requestAnimationFrame(animateCard);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [allManuscripts.length]);

  useEffect(() => {
    if (!allManuscripts.length) return;
    const spacer = document.createElement("div");
    spacer.style.height = `${SECTION_HEIGHT * allManuscripts.length}px`;
    spacer.style.width = "1px";
    spacer.style.position = "absolute";
    spacer.style.top = "0";
    spacer.style.left = "0";
    spacer.style.zIndex = "-1";
    document.body.appendChild(spacer);
    return () => {
      if (spacer && document.body.contains(spacer)) {
        document.body.removeChild(spacer);
      }
    };
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
    isTicking.current = true;
  }, []);

  useEffect(() => {
    setAnimatedIndex(visibleIndex);
    currentAnimatedIndex.current = visibleIndex;
    targetIndex.current = visibleIndex;
  }, [visibleIndex]);

  if (loading)
    return <div className="carousel-loading">Loading…</div>;
  if (!allManuscripts.length)
    return <div className="carousel-loading">No manuscripts found.</div>;

  const idx = Math.floor(animatedIndex);
  const t = animatedIndex - idx;
  const mCurrent = allManuscripts[idx];
  const mNext = allManuscripts[idx + 1];

  const m = t < 0.5 || !mNext ? mCurrent : mNext;
  const verluchtingen = (verluchtingenMap[m.identifier] || []).filter((v) => v.identifier);

  return (
    <>
      <Navbar />
      <div className="carousel-outer clean" style={{
        minHeight: "100vh",
        position: "fixed",
        width: "100vw",
        top: 80,
        left: 0,
        zIndex: 10,
        background: "#232323"
      }}>
        <div
          className="manuscript-vertical-scroll"
          style={{
            maxHeight: "100vh",
            overflow: "hidden",
            width: "100vw",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <section
            key={m.identifier}
            className="carousel-center double-card"
            style={{
              marginBottom: "0",
              scrollMarginTop: "2.5rem",
              border: "none",
              paddingBottom: "0",
              justifyContent: "center",
              alignItems: "stretch",
              width: "100vw",
              minHeight: "70vh",
              background: "rgba(35,35,35,0.97)",
              borderRadius: "32px",
              boxShadow: "0 8px 32px #0003",
              transition: "box-shadow 0.3s",
              zIndex: 11,
              pointerEvents: "auto",
            }}
            id={`manuscript-${idx}`}
          >
            <div className="carousel-card" tabIndex={0} style={{
              width: "46vw",
              minWidth: 340,
              maxWidth: 700,
              minHeight: "70vh",
              margin: "2vh 0",
              fontSize: "1.1rem",
              borderRadius: "32px",
              boxShadow: "0 8px 32px #0002"
            }}>
              <div className="carousel-header">
                <span className="carousel-title">{m.title || m.id}</span>
              </div>
              <div className="carousel-fields">
                {FIELDS.map(
                  (field) =>
                    m[field.key] && (
                      <div className="carousel-field" key={field.key}>
                        <span className="carousel-label">{field.label}:</span>
                        <span className="carousel-value">{m[field.key]}</span>
                      </div>
                    )
                )}
              </div>
              {m.imageUrl && (
                <div className="carousel-img" style={{ height: 220 }}>
                  <img src={m.imageUrl} alt={m.title || m.id} />
                </div>
              )}
              {m.provenance && (
                <div className="carousel-provenance">
                  <span className="carousel-label">Provenance:</span>
                  <span className="carousel-value">{m.provenance}</span>
                </div>
              )}
              <div className="carousel-progress" style={{ fontSize: "1.1rem" }}>
                {idx + 1} / {allManuscripts.length}
              </div>
            </div>
            {/* Verluchtingen Vertical Scroll */}
            <div className="verluchtingen-card clean" style={{
              width: "46vw",
              minWidth: 340,
              maxWidth: 700,
              minHeight: "70vh",
              borderRadius: "32px",
              boxShadow: "0 8px 32px #0002"
            }}>
              <div className="verluchtingen-header">
                <span className="verluchtingen-title">Verluchtingen</span>
                {verluchtingen.length > 1 && (
                  <span className="verluchtingen-count-pill">
                    {verluchtingen.length} images
                  </span>
                )}
              </div>
              {verluchtingenLoading[m.identifier] ? (
                <div className="verluchtingen-empty">Loading verluchtingen…</div>
              ) : verluchtingen.length === 0 ? (
                <div className="verluchtingen-empty">
                  No verluchtingen with images for this manuscript.
                </div>
              ) : (
                <div
                  className="verluchting-vertical-scroll"
                  style={{
                    maxHeight: "360px",
                    overflowY: "auto",
                    paddingRight: "8px",
                    marginTop: "0.7rem",
                  }}
                >
                  {verluchtingen.map((v, vIdx) => (
                    <div className="verluchting-image-slide-v2" key={vIdx} style={{ marginBottom: "1.2rem" }}>
                      <div
                        className="verluchting-image-maxbox-v2"
                        onClick={() => setZoomImg(v.identifier)}
                        tabIndex={0}
                        style={{ cursor: "zoom-in", position: "relative" }}
                      >
                        <img
                          src={v.identifier}
                          alt={v.title || "Verluchting"}
                          className="verluchting-big-img"
                          draggable={false}
                        />
                        <span className="img-zoom-overlay">
                          <FaExpand /> <span>Zoom</span>
                        </span>
                      </div>
                      <div className="verluchting-image-info-v2">
                        {v.title && <div className="verluchting-image-title">{v.title}</div>}
                        {v.folio && <div className="verluchting-image-folio">{v.folio}</div>}
                        <div className="verluchting-image-progress">
                          {vIdx + 1} / {verluchtingen.length}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
        {/* Timeline marker */}
        <div
          style={{
            position: "fixed",
            left: "3vw",
            top: "20%",
            transform: "translateY(-50%)",
            zIndex: 20,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              background: "#fff",
              color: "#232323",
              borderRadius: "22px",
              padding: "10px 22px",
              fontWeight: 700,
              fontSize: "1.3rem",
              boxShadow: "0 3px 12px rgba(0,0,0,0.13)",
              opacity: 0.93,
              marginBottom: "1rem",
              textAlign: "center",
            }}
          >
            {m.year}
          </div>
        </div>
      </div>
      {/* Zoom Modal */}
      <Modal
        isOpen={!!zoomImg}
        onRequestClose={() => setZoomImg(null)}
        contentLabel="Verluchting Image Zoom"
        className="img-modal"
        overlayClassName="img-modal-overlay"
      >
        {zoomImg && (
          <img
            src={zoomImg}
            alt="Verluchting zoom"
            className="img-modal-img"
          />
        )}
        <button className="img-modal-close" onClick={() => setZoomImg(null)}>
          &times;
        </button>
      </Modal>
    </>
  );
};

export default CarouselTimelineScroll;
