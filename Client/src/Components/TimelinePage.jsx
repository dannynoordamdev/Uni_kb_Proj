import React from 'react';
import CarouselTimelineScroll from './Timeline';
import Navbar from './Navbar';
import Footer from './Footer';
import FeaturedManuscripts from './FeaturedManuscripts';
import HeroTimeline from './HeroTimeline';
import '../Components/Herotimeline.css'



const TimelinePage = () => {
    return (
        <div>
            <Navbar />
            <HeroTimeline />
            
            <div id="timeline-section"> 
                <CarouselTimelineScroll />
            </div>
            
            <FeaturedManuscripts />
            <Footer />
        </div>
    );
};


export default TimelinePage;