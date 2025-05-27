import React from 'react';
import CarouselTimelineScroll from './Timeline';
import Navbar from './Navbar';
import Footer from './Footer';

const TimelinePage = () => {
    return (
        <div>
            <Navbar />
            <CarouselTimelineScroll />
            <Footer />
        </div>
    );
};

export default TimelinePage;