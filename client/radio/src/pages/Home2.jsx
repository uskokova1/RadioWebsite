import React, {useEffect, useRef, useState} from 'react'
import PixelBlast from '../components/PixelBlast.jsx'
import Wigglie from "../components/Wigglie.jsx";
import * as rasterizeHTML from 'rasterizehtml';

const Home2 = () => {

    return (
    <div className='absolute w-screen h-screen bg-black'>
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
            transparent={true}
        />
        <div className='absolute left-1/2 top-0 w-150 h-100 -translate-x-1/2 -scale-y-100'>
            <PixelBlast
                variant="circle"
                pixelSize={4}
                color="#ff0000"
                patternScale={2}
                patternDensity={4}
                pixelSizeJitter={0.85}
                enableRipples={false}
                rippleSpeed={0.4}
                rippleThickness={0.12}
                rippleIntensityScale={1.5}
                liquid={true}
                liquidStrength={0.02}
                liquidRadius={0.2}
                liquidWobbleSpeed={2}
                speed={0.5}
                edgeFade={1.2}
                transparent={true}
            />
        </div>
        <Wigglie className="absolute top-10 left-1/2 -translate-x-1/2">

            <h1 className='relative z-10 text-8xl text-[#ff0000] hover:scale-110 transition-all'
            > WSIN </h1>
            <h1 className='absolute top-0 text-8xl text-[#ff0000] blur-md'
            > WSIN </h1>

            {/* <h1 className='text-8xl text-[#ff0000] dissolve drop-shadow-gray-500 drop-shadow-2xl'> WSIN </h1>
        */}
        </Wigglie>

    </div>
    )
}
export default Home2
