import React from 'react';
import CarouselTimelineScroll from './Timeline';
import Navbar from './Navbar';
import Footer from './Footer';
import FeaturedManuscripts from './FeaturedManuscripts';
import HeroTimeline from './HeroTimeline';
import '../Components/Herotimeline.css';
import WorldMap from '../Components/WorldMap';



const TimelinePage = () => {
    return (
        <div>
            <Navbar />
            <HeroTimeline />
            <div style={{ height: "150px", backgroundColor: "F0F0F0" }}></div>
            
            <div id="timeline-section"> 
                <CarouselTimelineScroll />
            </div>

            <div style={{ height: "150px", backgroundColor: "F0F0F0" }}></div>


            <WorldMap />

            <div style={{ height: "150px", backgroundColor: "F0F0F0" }}></div>

            
            <div id="featured">
            <FeaturedManuscripts />
            </div>
            <Footer />
        </div>
    );
};


export default TimelinePage;