import React, { useState, useEffect, useRef } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import './Timeline.css';

const Timeline = () => {
  const [manuscripts, setManuscripts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verluchtingen state
  const [verluchtingen, setVerluchtingen] = useState([]);
  const [verluchtingenLoading, setVerluchtingenLoading] = useState(false);
  const [verluchtingenError, setVerluchtingenError] = useState(null);
  const [verluchtingIndex, setVerluchtingIndex] = useState(0);

  // Afbeelding van het manuscript zelf (van Illustration in verluchting)
  const [manuscriptImage, setManuscriptImage] = useState(null);

  const scrollTimeout = useRef(null);

  useEffect(() => {
    fetch('/api/manuscripts')
      .then(res => res.ok ? res.json() : Promise.reject('Failed to fetch'))
      .then(data => {
        setManuscripts(data.sort((a, b) => {
          const getYear = (d) => parseInt(d?.match(/^(\d{4})/)?.[1]) || 0;
          return getYear(a.date) - getYear(b.date);
        }));
        setLoading(false);
      })
      .catch(err => {
        setError(err.toString());
        setLoading(false);
      });
  }, []);

  const currentManuscript = manuscripts[currentIndex];

  // Ophalen verluchtingen bij manuscript-wissel
  useEffect(() => {
    setVerluchtingIndex(0); // reset bij nieuw manuscript
    setManuscriptImage(null); // reset afbeelding bij nieuw manuscript

    if (!currentManuscript?.identifier) {
      setVerluchtingen([]);
      return;
    }
    setVerluchtingenLoading(true);
    setVerluchtingenError(null);
    fetch(`/api/verluchtingen/bymanuscript/${currentManuscript.identifier}`)
      .then(res => res.ok ? res.json() : Promise.reject('Failed to fetch verluchtingen'))
      .then(data => {
        // Filter verluchtingen zonder afbeelding (thumbnail of identifier)
        const filtered = data
          .filter(v => (v.identifier))
          .sort((a, b) => (a.recordPosition || 0) - (b.recordPosition || 0));
        setVerluchtingen(filtered);
        setVerluchtingenLoading(false);

        // Pak de manuscript afbeelding uit de eerste verluchting als die een 'Illustration' property heeft
        if (filtered.length > 0) {
          // Illustration kan een url zijn in filtered[0].Illustration
          // of als je een array of object hebt, pas aan naar jouw data-structuur
          const illustration = filtered[0].Illustration || null;
          setManuscriptImage(illustration);
        } else {
          setManuscriptImage(null);
        }
      })
      .catch(err => {
        setVerluchtingenError(err.toString());
        setVerluchtingenLoading(false);
        setManuscriptImage(null);
      });
  }, [currentManuscript?.identifier]);

  // Scroll handler voor tijdlijn
  const handleWheel = (e) => {
    e.preventDefault();
    if (scrollTimeout.current) return;
    scrollTimeout.current = setTimeout(() => {
      scrollTimeout.current = null;
    }, 100);
    setCurrentIndex((i) => {
      if (e.deltaY > 0) return Math.min(i + 1, manuscripts.length - 1);
      else return Math.max(i - 1, 0);
    });
  };

  // Carousel controls
  const prevVerluchting = () => {
    setVerluchtingIndex((i) =>
      i === 0 ? verluchtingen.length - 1 : i - 1
    );
  };
  const nextVerluchting = () => {
    setVerluchtingIndex((i) =>
      i === verluchtingen.length - 1 ? 0 : i + 1
    );
  };

  // Skip verluchtingen waarvan de afbeelding niet laadt
  const handleImageError = () => {
    // Verwijder deze verluchting uit de lijst
    setVerluchtingen((prev) => {
      const newList = prev.filter((_, idx) => idx !== verluchtingIndex);
      // Corrigeer index als nodig
      if (verluchtingIndex >= newList.length) {
        setVerluchtingIndex(Math.max(0, newList.length - 1));
      }
      return newList;
    });
  };

  return (
    <>
      <Navbar />
      <div className="timeline-container">
        <div className="timeline-header-row">
          <h1>{currentManuscript?.date?.slice(0, 4) || '—'}</h1>
          <div className="warn">
            <p>Scroll verticaal om door de tijdlijn te bewegen.</p>
          </div>
        </div>

        <div className="card-box">
          <div className="timeline-card">
            <h2>Manuscript</h2>
            {loading && <p>Loading manuscripts...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {!loading && !error && currentManuscript ? (
              <div>
                {/* Manuscript afbeelding als die er is */}
                {manuscriptImage && (
                  <img
                    src={manuscriptImage}
                    alt={currentManuscript.title || 'Manuscript afbeelding'}
                    className="verluchting-image-main"
                    style={{ marginBottom: '1rem' }}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                )}
                <strong>{currentManuscript.title || 'Zonder titel'}</strong>
                {currentManuscript.creator && <div><em>{currentManuscript.creator}</em></div>}
                {currentManuscript.date && <div>{currentManuscript.date}</div>}
                {currentManuscript.description && <div>{currentManuscript.description}</div>}
              </div>
            ) : (
              <p>Geen manuscripten gevonden.</p>
            )}
          </div>

          <div className="vertical-timeline" onWheel={handleWheel}>
            <div className="timeline-line">
              <div
                className="timeline-indicator"
                style={{
                  top:
                    manuscripts.length > 1
                      ? `${(currentIndex / (manuscripts.length - 1)) * 100}%`
                      : '0%',
                }}
              />
            </div>
          </div>

          <div className="timeline-card">
            <h2>Verluchtingen</h2>
            {verluchtingenLoading && <p>Bezig met laden...</p>}
            {verluchtingenError && <p style={{ color: 'red' }}>{verluchtingenError}</p>}
            {!verluchtingenLoading && !verluchtingenError && verluchtingen.length === 0 && (
              <p>Geen verluchtingen met afbeelding gevonden voor dit manuscript.</p>
            )}
            {!verluchtingenLoading && verluchtingen.length > 0 && (
              <div className="verluchting-carousel">
                <button
                  className="carousel-btn"
                  onClick={prevVerluchting}
                  aria-label="Vorige"
                >
                  ◀
                </button>
                <div className="verluchting-carousel-content">
                  <img
                    src={verluchtingen[verluchtingIndex].identifier}
                    alt={verluchtingen[verluchtingIndex].title || 'Verluchting'}
                    className="verluchting-image-main"
                    onError={handleImageError}
                  />
                  <div className="verluchting-main-info">
                    <strong>{verluchtingen[verluchtingIndex].title || 'Zonder titel'}</strong>
                    {verluchtingen[verluchtingIndex].folio && (
                      <div>
                        <em>Folio: {verluchtingen[verluchtingIndex].folio}</em>
                      </div>
                    )}
                    {verluchtingen[verluchtingIndex].creator && (
                      <div>{verluchtingen[verluchtingIndex].creator}</div>
                    )}
                  </div>
                  <div className="carousel-indicator">
                    {verluchtingIndex + 1} / {verluchtingen.length}
                  </div>
                </div>
                <button
                  className="carousel-btn"
                  onClick={nextVerluchting}
                  aria-label="Volgende"
                >
                  ▶
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Timeline;
