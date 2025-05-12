import React from 'react';
import Timeline from '../Components/Timeline';
import WorldMap from '../Components/WorldMap';
import Footer from '../Components/Footer';
import Hero from '../Components/Hero';
import '../Pages/Home.css';


const Home = () => {
    return (
        <div className='container'>

            {/* Content van de hoofdpagina*/}
            <div className="full-width-section" id="home">
                <Hero />
            </div> 

            {/* Content van de timeline */}
            <div className="section" id="timeline">
                <Timeline />
            </div>

            {/* Content van de wereldkaart */}
            <div className="section" id="third-place">
                <WorldMap />
            </div>

            {/* Footer */}
            <div id="footer">
                <Footer />
            </div>


        </div>
    );
};

export default Home;