import React, { useEffect, useState, useRef, useCallback } from 'react';
import './Timeline.css';

const TimelineScroll = () => {
  const [animatedScrollY, setAnimatedScrollY] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);

  const spacerRef = useRef(null);
  const rafId = useRef(null);
  const targetScrollY = useRef(0);
  const currentAnimatedScrollY = useRef(0);
  const isTicking = useRef(false);

  const startYear = 1200;
  const endYear = 1800;
  const pixelsPerYear = 50;
  const sectionsHeight = 4000;
  const backgroundColors = ['#add8e6', '#d0a22b'];
  const smoothingFactor = 0.08;
  const markerHeightApproximation = 80;

  const totalYears = endYear - startYear;
  const totalScrollHeight = totalYears * pixelsPerYear;

  const calculateCurrentProps = (scrollY) => {
    const yearOffset = Math.floor(scrollY / pixelsPerYear);
    const year = Math.min(startYear + yearOffset, endYear);

    const sectionIndex = Math.floor(scrollY / sectionsHeight);
    const colorIndex = sectionIndex % backgroundColors.length;
    const bgColor = backgroundColors[colorIndex];

    return { year, bgColor };
  };

  const { year: currentYear, bgColor } = calculateCurrentProps(animatedScrollY);

  const calculateClampedMarkerY = useCallback(() => {
    const visualMaxY = Math.max(0, viewportHeight - markerHeightApproximation);

    const clampedScrollY = Math.min(totalScrollHeight, Math.max(0, animatedScrollY));
    const progressRatio = totalScrollHeight > 0 ? clampedScrollY / totalScrollHeight : 0;

    return progressRatio * visualMaxY;

  }, [animatedScrollY, totalScrollHeight, viewportHeight, markerHeightApproximation]);

  const clampedMarkerTranslateY = calculateClampedMarkerY();

  const animateScroll = useCallback(() => {
    const diff = targetScrollY.current - currentAnimatedScrollY.current;

    if (Math.abs(diff) < 0.1) {
      currentAnimatedScrollY.current = targetScrollY.current;
      setAnimatedScrollY(currentAnimatedScrollY.current);
      rafId.current = null;
      isTicking.current = false;
      return;
    }

    currentAnimatedScrollY.current += diff * smoothingFactor;
    setAnimatedScrollY(currentAnimatedScrollY.current);

    rafId.current = requestAnimationFrame(animateScroll);
    isTicking.current = true;

  }, [smoothingFactor]);

  const handleScroll = useCallback(() => {
    targetScrollY.current = window.scrollY;
    if (!rafId.current && !isTicking.current) {
       isTicking.current = true;
       rafId.current = requestAnimationFrame(animateScroll);
    }
  }, [animateScroll]);

  useEffect(() => {
    const spacer = document.createElement('div');
    spacer.style.height = `${totalScrollHeight}px`;
    spacer.style.width = '1px';
    spacer.style.position = 'absolute';
    spacer.style.top = '0';
    spacer.style.left = '0';
    spacer.style.zIndex = '-1';
    document.body.appendChild(spacer);
    spacerRef.current = spacer;

    targetScrollY.current = window.scrollY;
    currentAnimatedScrollY.current = window.scrollY;
    setAnimatedScrollY(window.scrollY);
    setViewportHeight(window.innerHeight);

    const handleResize = () => {
      setViewportHeight(window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
      isTicking.current = false;
      if (spacerRef.current && document.body.contains(spacerRef.current)) {
        document.body.removeChild(spacerRef.current);
      }
    };
  }, [totalScrollHeight, handleScroll]);

  return (
    <div
      className="timeline-container"
      style={{ backgroundColor: bgColor }}
    >

      
      <div className="floating-card">
        <h2>Manuscript Title</h2>

        <div className="main-image-box">
          <img src="main-image.jpg" alt="Main Manuscript" />
        </div>

        <div className="image-grid">
          <img src="image1.jpg" alt="Related Image 1" />
          <img src="image2.jpg" alt="Related Image 2" />
          <img src="image3.jpg" alt="Related Image 3" />
        </div>

        <button className="learn-more-button">Learn More</button>
      </div>

      <div className="vertical-timeline">
        <div className="timeline-line"></div>
        <div
          className="timeline-year-marker"
          style={{ transform: `translateY(${clampedMarkerTranslateY}px)` }}
        >
          <div className="year-bubble">
            <span className="year-text">{currentYear}</span>
          </div>
        </div>
      </div>

      <div className="timeline-content">
        <div className="year-display">
          <h1 className="year">{currentYear}</h1>
        </div>
        <div className="historical-events-container">
          <p style={{ marginTop: '2rem', color: '#555' }}>
            Bekijk Manuscripten van deze periode.
          </p>
          <p style={{ marginTop: '1rem', fontStyle: 'italic', color: '#777' }}>
            Scroll naar beneden om nieuwe manuscripten te ontdekken.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TimelineScroll;
