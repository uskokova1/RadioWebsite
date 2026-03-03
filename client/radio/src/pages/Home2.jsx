import React, {useEffect, useRef, useState} from 'react'
import PixelBlast from '../components/PixelBlast.jsx'
import Wigglie from "../components/Wigglie.jsx";
import * as rasterizeHTML from 'rasterizehtml';

const Home2 = () => {

    return (
    <div className='w-screen h-screen bg-white'>
        {/*
        <PixelBlast
            variant="circle"
            pixelSize={2}
            color="#ff0000"
            patternScale={2}
            patternDensity={1}
            pixelSizeJitter={0.85}
            enableRipples={false}
            rippleSpeed={0.4}
            rippleThickness={0.12}
            rippleIntensityScale={1.5}
            liquid={false}
            liquidStrength={0.12}
            liquidRadius={1.2}
            liquidWobbleSpeed={5}
            speed={0.5}
            edgeFade={0.4}
            transparent={false}
        /> */}
        <Wigglie className="absolute top-10 left-1/2 -translate-x-1/2">
            <svg viewBox='0 0 0 0' xmlns='http://www.w3.org/2000/svg'>
                <defs>
                <filter id='noiseFilter'>
                    <feTurbulence
                        type='fractalNoise'
                        baseFrequency='0.65'
                        numOctaves='3'
                        stitchTiles='stitch'/>
                </filter>
                </defs>
            </svg>

            <h1 className='text-8xl text-[#ff0000] dissolve drop-shadow-gray-500 drop-shadow-2xl'
                style={{ filter: 'url(#)' }}
            > WSIN </h1>

            {/* <h1 className='text-8xl text-[#ff0000] dissolve drop-shadow-gray-500 drop-shadow-2xl'> WSIN </h1>
        */}
        </Wigglie>

    </div>
    )
}
export default Home2
