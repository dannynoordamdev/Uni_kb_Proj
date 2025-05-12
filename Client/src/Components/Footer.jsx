import React from 'react';
import kbLogo from '../assets/kb-logo.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXTwitter, faLinkedinIn, faInstagram, faFacebookF } from '@fortawesome/free-brands-svg-icons';
import './footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="logoWrapper">
          <a href="/" aria-label="KB, nationale bibliotheek van Nederland">
            <img src={kbLogo} alt="KB Logo" className="logo" />
          </a>
          <div className="infoText">
            <p>Data Visualizatie Project voor de KB,<br/> door studenten van de HHS.</p>
          </div>
          <hr className='footer_hr'/>
          <div className="followUs">
            <p>Volg de Koninklijke Bibliotheek op:</p>
            <div className="socialIcons">
              <a href="#" aria-label="X"><FontAwesomeIcon icon={faXTwitter} /></a>
              <a href="#" aria-label="LinkedIn"><FontAwesomeIcon icon={faLinkedinIn} /></a>
              <a href="#" aria-label="Instagram"><FontAwesomeIcon icon={faInstagram} /></a>
              <a href="#" aria-label="Facebook"><FontAwesomeIcon icon={faFacebookF} /></a>
            </div>
          </div>
        </div>

        <div className="linksContainer">
          <div className="linkColumn">
            <h3>Zoeken</h3>
            <ul>
              <li><a href="#">Tijdlijn</a></li>
              <li><a href="#">Digitale bronnen</a></li>
              <li><a href="#">Wikidata</a></li>
            </ul>
          </div>
          <div className="linkColumn">
            <h3>Speciaal</h3>
            <ul>
              <li><a href="#">Over ons</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </div>
          <div className="linkColumn">
            <h3>Over deze site</h3>
            <ul>
              <li><a href="#">Auteursrecht</a></li>
              <li><a href="#">Privacy en AVG</a></li>
              <li><a href="#">Responsible disclosure</a></li>
              <li><a href="#">Toegankelijkheid</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;