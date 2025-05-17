import React from 'react';
import kbLogo from '../assets/kb-logo-zw.svg'; 
import {useState} from 'react';
import '../Components/Navbar.css'; 


const Navbar = () => {

        const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); 
const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (


        <nav className="navbar">
                        <a href="/" aria-label="KB, nationale bibliotheek van Nederland" className="logo-link"> 
                            <img src={kbLogo} alt="KB Logo" className="kb-logo-zw" />
                        </a>
                        <button className="hamburger-menu" onClick={toggleMobileMenu} aria-expanded={isMobileMenuOpen} aria-controls="mobile-nav">
                            <div className="bar"></div>
                            <div className="bar"></div>
                            <div className="bar"></div>
                        </button>
                        <div className={`nav-links ${isMobileMenuOpen ? 'open' : ''}`} id="mobile-nav"> 
                            <a href="#" className="nav-link">Handschriften</a>
                            <a href="#" className="nav-link">Visualisaties</a>
                            <a href="#" className="nav-link">Over ons</a>
                            <a href="#" className="nav-link">Contact</a>
                        </div>
        </nav>
    );
};

export default Navbar;