import React, { useState, useEffect, useCallback } from "react";
import { Carousel } from "react-responsive-carousel";
import Modal from "react-modal";
import { FaChevronLeft, FaChevronRight, FaExpand } from "react-icons/fa";
import "react-responsive-carousel/lib/styles/carousel.min.css";
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

const VERLUCHTING_FIELDS = [
  { label: "Title", key: "title" },
  { label: "Folio", key: "folio" },
];

const CarouselTimeline = () => {
  const [manuscripts, setManuscripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [verluchtingen, setVerluchtingen] = useState([]);
  const [verlLoading, setVerlLoading] = useState(false);
  const [verlIndex, setVerlIndex] = useState(0);

  // Modal for zoom
  const [zoomImg, setZoomImg] = useState(null);

  useEffect(() => {
    fetch("/api/manuscripts")
      .then((res) => res.json())
      .then((data) => {
        const withYear = data
          .map((m) => ({ ...m, year: extractYear(m.date) }))
          .filter((m) => m.year && m.identifier);
        withYear.sort((a, b) => parseInt(a.year) - parseInt(b.year));
        setManuscripts(withYear);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!manuscripts.length) return;
    const shelfmark = manuscripts[currentIndex]?.identifier;
    if (!shelfmark) {
      setVerluchtingen([]);
      return;
    }
    setVerlLoading(true);
    fetch(`/api/Verluchtingen/bymanuscript/${encodeURIComponent(shelfmark)}`)
      .then((res) => res.json())
      .then((data) => {
        setVerluchtingen(Array.isArray(data) ? data : []);
        setVerlIndex(0);
        setVerlLoading(false);
      })
      .catch(() => {
        setVerluchtingen([]);
        setVerlIndex(0);
        setVerlLoading(false);
      });
  }, [manuscripts, currentIndex]);

  // Keyboard navigation
  const handleKey = useCallback(
    (e) => {
      if (e.key === "ArrowLeft") setCurrentIndex((i) => Math.max(0, i - 1));
      if (e.key === "ArrowRight") setCurrentIndex((i) => Math.min(manuscripts.length - 1, i + 1));
    },
    [manuscripts.length]
  );
  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  if (loading) return <div className="carousel-loading">Loading…</div>;
  if (!manuscripts.length) return <div className="carousel-loading">No manuscripts found.</div>;

  const m = manuscripts[currentIndex];
  const verluchtingenWithImage = verluchtingen.filter((v) => v.identifier);

  return (
    <>
      <Navbar />
      <div className="carousel-outer clean">
        <h1 className="timeline-h1-date">{m.year}</h1>
        <button
          className="carousel-nav left"
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
          aria-label="Previous"
        >
          <FaChevronLeft />
        </button>
        <div className="carousel-center double-card">
          {/* Main Manuscript Card */}
          <div className="carousel-card" tabIndex={0}>
            <div className="carousel-header">
              <span className="carousel-year">{m.year}</span>
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
              <div className="carousel-img">
                <img src={m.imageUrl} alt={m.title || m.id} />
              </div>
            )}
            {m.provenance && (
              <div className="carousel-provenance">
                <span className="carousel-label">Provenance:</span>
                <span className="carousel-value">{m.provenance}</span>
              </div>
            )}
            <div className="carousel-progress">
              {currentIndex + 1} / {manuscripts.length}
            </div>
          </div>

          {/* Verluchtingen Card */}
          <div className="verluchtingen-card clean">
            <div className="verluchtingen-header">
              <span className="verluchtingen-title">Verluchtingen</span>
              {verluchtingenWithImage.length > 1 && (
                <span className="verluchtingen-count-pill">
                  {verluchtingenWithImage.length} images
                </span>
              )}
            </div>
            {verlLoading ? (
              <div className="verluchtingen-empty">Loading…</div>
            ) : verluchtingenWithImage.length === 0 ? (
              <div className="verluchtingen-empty">
                No verluchtingen with images for this manuscript.
              </div>
            ) : (
              <Carousel
                showThumbs={false}
                showStatus={false}
                infiniteLoop
                useKeyboardArrows
                className="verluchting-carousel"
                swipeable
                emulateTouch
                dynamicHeight={false}
                centerMode={true}
                centerSlidePercentage={100}
                selectedItem={verlIndex}
                onChange={setVerlIndex}
                renderArrowPrev={(onClickHandler, hasPrev, label) =>
                  hasPrev && (
                    <button type="button" className="verluchting-arrow left" onClick={onClickHandler} aria-label="Prev verluchting">
                      <FaChevronLeft />
                    </button>
                  )
                }
                renderArrowNext={(onClickHandler, hasNext, label) =>
                  hasNext && (
                    <button type="button" className="verluchting-arrow right" onClick={onClickHandler} aria-label="Next verluchting">
                      <FaChevronRight />
                    </button>
                  )
                }
              >
                {verluchtingenWithImage.map((v, idx) => (
                  <div className="verluchting-image-slide-v2" key={idx}>
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
                        {idx + 1} / {verluchtingenWithImage.length}
                      </div>
                    </div>
                  </div>
                ))}
              </Carousel>
            )}
          </div>
        </div>
        <button
          className="carousel-nav right"
          onClick={() => setCurrentIndex((i) => Math.min(manuscripts.length - 1, i + 1))}
          disabled={currentIndex === manuscripts.length - 1}
          aria-label="Next"
        >
          <FaChevronRight />
        </button>
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

export default CarouselTimeline;
