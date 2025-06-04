import WorldMap from '../Components/WorldMap';
import Footer from '../Components/Footer';
import Hero from '../Components/Hero';
import '../Pages/Home.css';
import React from 'react';


const Home = () => {
    return (
        <div className='container'>

            {/* Content van de hoofdpagina*/}
            <div className="full-width-section" id="home">
                <Hero />
            </div> 
            
            {/* Footer */}
            <div id="footer">
                <Footer />
            </div>


        </div>
    );
};

export default Home;