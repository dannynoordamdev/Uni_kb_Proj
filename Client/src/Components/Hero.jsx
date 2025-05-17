import { useNavigate } from 'react-router-dom';
import '../Components/Hero.css';
import Navbar from './Navbar';

const Hero = () => {
    let navigate = useNavigate();
    const timelineNavigate = () => {
        navigate('/timeline');
    }

    return (
        <div className="hero">
            <Navbar />
            <div className="hero-container">
                <div className="hero-content">
                    <h1 className="hero-title">Middeleeuwse Handschriften<br />en Verluchtingen.</h1>
                    <p className="hero-subtitle">Bekijk bijzondere Manuscripten door middel van visualisaties.</p>
                    <button onClick={timelineNavigate} className="hero-button">Begin met tijdreizen</button>

                </div>
            </div>
        </div>
    );
};

export default Hero;