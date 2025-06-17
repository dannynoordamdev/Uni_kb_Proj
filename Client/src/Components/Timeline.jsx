import React, { useEffect, useState, useRef, useCallback } from "react";
import Modal from "react-modal";
import { FaExpand, FaSave, FaPlus, FaMinus } from "react-icons/fa"; // Import FaSave, FaPlus, FaMinus icons
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

  // State for modal zoom/pan
  const [modalImageScale, setModalImageScale] = useState(1);
  const [modalImageTranslateX, setModalImageTranslateX] = useState(0);
  const [modalImageTranslateY, setModalImageTranslateY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartCoords = useRef({ x: 0, y: 0 });
  const dragStartTranslate = useRef({ x: 0, y: 0 });

  const rafId = useRef(null);
  const targetIndex = useRef(0);
  const currentAnimatedIndex = useRef(0);
  const isTicking = useRef(false);
  const scrollContainerRef = useRef(null);
  const timelineBarRef = useRef(null); // Ref for the timeline bar
  const modalImgRef = useRef(null); // Ref for the image inside the modal

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

  // Effect to control body scroll when modal is open/closed
  useEffect(() => {
    if (zoomImg) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset'; // Resets to default or what's defined by CSS
    }
    // Cleanup function to ensure overflow is reset if component unmounts while modal is open
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [zoomImg]);


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

  const handleTimelineClick = (e) => {
    if (!timelineBarRef.current || !allManuscripts.length) return;

    const barRect = timelineBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - barRect.left;

    const timelineBarWidth = barRect.width;
    const effectiveBarWidth =
      timelineBarWidth - timelineLeftPad - timelineRightPad;

    const clickPercentage =
      (clickX - timelineLeftPad) / effectiveBarWidth;

    const newIndex = Math.round(
      clickPercentage * (allManuscripts.length - 1)
    );

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

  // Improved function to save image
  const handleSaveImage = async () => {
    if (!zoomImg) return;

    try {
      const response = await fetch(zoomImg);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const imageBlob = await response.blob();
      const url = window.URL.createObjectURL(imageBlob);
      const link = document.createElement('a');
      link.href = url;
      // Extract filename from URL or use a generic one
      const filename = zoomImg.substring(zoomImg.lastIndexOf('/') + 1) || `verluchting_image_${new Date().getTime()}.png`;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url); // Clean up the object URL
    } catch (error) {
      console.error("Error saving image:", error);
      alert("Failed to save image. Please try again.");
    }
  };

  // Reset zoom/pan when modal is opened/closed
  useEffect(() => {
    if (zoomImg) {
      setModalImageScale(1);
      setModalImageTranslateX(0);
      setModalImageTranslateY(0);
    }
  }, [zoomImg]);

  // Modal zoom and pan handlers
  const handleWheelZoom = (e) => {
    e.preventDefault();
    const scaleAmount = 0.1;
    const newScale = e.deltaY < 0
      ? Math.min(modalImageScale + scaleAmount, 5) // Max zoom 5x
      : Math.max(modalImageScale - scaleAmount, 1); // Min zoom 1x (original size)

    // Optional: Zoom towards mouse cursor
    // const rect = e.target.getBoundingClientRect();
    // const x = e.clientX - rect.left;
    // const y = e.clientY - rect.top;

    // // Calculate new translate to keep mouse cursor in place
    // const newTranslateX = modalImageTranslateX - (x / modalImageScale - x / newScale);
    // const newTranslateY = modalImageTranslateY - (y / modalImageScale - y / newScale);

    setModalImageScale(newScale);
    // setModalImageTranslateX(newTranslateX);
    // setModalImageTranslateY(newTranslateY);
  };

  const handleManualZoom = (direction) => {
    const scaleAmount = 0.2;
    let newScale = modalImageScale;
    if (direction === 'in') {
      newScale = Math.min(modalImageScale + scaleAmount, 5);
    } else {
      newScale = Math.max(modalImageScale - scaleAmount, 1);
    }
    setModalImageScale(newScale);
    // If zooming out to 1x, reset translation
    if (newScale === 1) {
      setModalImageTranslateX(0);
      setModalImageTranslateY(0);
    }
  };

  const handleMouseDown = (e) => {
    if (modalImageScale > 1) { // Only allow dragging if zoomed in
      setIsDragging(true);
      dragStartCoords.current = { x: e.clientX, y: e.clientY };
      dragStartTranslate.current = { x: modalImageTranslateX, y: modalImageTranslateY };
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging || modalImageScale === 1) return; // Only drag if zoomed in and dragging
    const dx = e.clientX - dragStartCoords.current.x;
    const dy = e.clientY - dragStartCoords.current.y;

    setModalImageTranslateX(dragStartTranslate.current.x + dx);
    setModalImageTranslateY(dragStartTranslate.current.y + dy);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Apply cursor style based on dragging state
  const imageCursorStyle = modalImageScale > 1
    ? (isDragging ? 'grabbing' : 'grab')
    : 'default';


  if (loading) return <div className="carousel-loading">Laden...</div>;
  if (!allManuscripts.length)
    return <div className="carousel-loading">Geen manuscripten gevonden.</div>;

  const timelineBarWidth = 480;
  const timelineDotSize = 22;
  const timelineLeftPad = 18;
  const timelineRightPad = 18;

  const availableHeight = `calc(100vh - 200px)`;
  const scrollContainerHeight = `calc(100vh - 200px)`;

  return (
    <>
      <div className="carousel-outer clean">
        {/* Timeline Header */}
        <div className="timeline-header-text">Door de tijd heen</div>

        {/* Timeline Bar */}
        <div
          ref={timelineBarRef}
          className="timeline-bar"
          style={{ width: timelineBarWidth, height: 36 }}
          onClick={handleTimelineClick}
          onMouseMove={handleTimelineMouseMove}
          onMouseLeave={handleTimelineMouseLeave}
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
                {!isActive && hoveredYear && manu.year === hoveredYear && (
                  <div className="timeline-year-preview">{hoveredYear}</div>
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
          <img
            ref={modalImgRef}
            src={zoomImg}
            alt="Verluchting zoom"
            className="img-modal-img"
            style={{
              transform: `scale(${modalImageScale}) translate(${modalImageTranslateX}px, ${modalImageTranslateY}px)`,
              cursor: imageCursorStyle,
              transition: isDragging ? 'none' : 'transform 0.1s ease-out', // Smooth transition only when not dragging
            }}
            onWheel={handleWheelZoom}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp} // Stop dragging if mouse leaves image
            draggable="false" // Prevent native image dragging
          />
        )}
        <button
          className="img-modal-close"
          onClick={() => setZoomImg(null)}
          title="Sluiten"
        >
          &times;
        </button>
        <button
          className="img-modal-save"
          onClick={handleSaveImage}
          title="Afbeelding opslaan"
        >
          <FaSave />
        </button>
        {modalImageScale > 1 && ( // Show zoom reset button only when zoomed in
          <button
            className="img-modal-reset-zoom"
            onClick={() => {
              setModalImageScale(1);
              setModalImageTranslateX(0);
              setModalImageTranslateY(0);
            }}
            title="Reset Zoom"
          >
            1x
          </button>
        )}
        <div className="img-modal-zoom-controls">
          <button onClick={() => handleManualZoom('in')} title="Zoom In">
            <FaPlus />
          </button>
          <button onClick={() => handleManualZoom('out')} title="Zoom Out">
            <FaMinus />
          </button>
        </div>
      </Modal>
    </>
  );
};

export default CarouselTimelineScroll;