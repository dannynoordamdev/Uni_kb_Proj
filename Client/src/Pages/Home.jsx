import Footer from '../Components/Footer';
import Hero from '../Components/Hero';
import '../Pages/Home.css';
import React from 'react';
import WorldMap from '../Components/WorldMap';


const Home = () => {
    return (
        <div className='container'>

            {/* Content van de hoofdpagina*/}
            <div className="full-width-section" id="home">
                <Hero />
            </div> 

            <WorldMap/>
            
            {/* Footer */}
            <div id="footer">
                <Footer />
            </div>


        </div>
    );
};

export default Home;