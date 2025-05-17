import React from 'react';
import { scaleLinear } from '@visx/scale';
import { Group } from '@visx/group';
import { AxisLeft } from '@visx/axis';
import { Text } from '@visx/text';
import { RectClipPath } from '@visx/clip-path';
import Navbar from './Navbar';
import '../Components/Timeline.css';



const Timeline = () => {
  return (
    <>
      <Navbar />
      <div className="timeline-container">
        <div className="timeline-scroll">
          
        </div>
      </div>
    </>
  );
};

export default Timeline;
