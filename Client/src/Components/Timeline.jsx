import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import './Timeline.css';


const Timeline = () => {
  return (
    <>
      <Navbar />


      <div className="timeline-container">
        <div className="timeline-header-row">
          <h1>1400</h1>
          <div className="timeline-line" />
        </div>
        <div className="warn">
                  <p>Scroll horizontaal om door de tijdlijn te bewegen.</p>
        </div>
        <div className="timeline-scroll">
          <div className="timeline-card">Card 1</div>
          <div className="timeline-card">Card 2</div>
          <div className="timeline-card">Card 3</div>
        </div>
      </div>

      <Footer />


    </>
  );
};

export default Timeline;
