import React, {useState, useEffect} from "react";


const Wigglie = ({className, children}) => {

    // State to hold the current random number
    const [seed, setRandomNumber] = useState(0);

    // Function to generate a new random number within a range
    const generateNewRandomNumber = () => {
        // Generate a random integer between 1 and 100 (inclusive)
        const min = 1;
        const max = 1000;
        const newNumber = Math.floor(Math.random() * (max - min + 1)) + min; //
        setRandomNumber(newNumber);
    };

    useEffect(() => {
        // Set up the interval to run generateNewRandomNumber every 1000ms (1 second)
        const intervalId = setInterval(generateNewRandomNumber, 500);

        // Clean up the interval when the component unmounts or the effect re-runs
        return () => clearInterval(intervalId);
    }, []); // The empty dependency array ensures the effect runs only once on mount


    return (
        <>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                style={{ position: "absolute", width: 0, height: 0 }}
            >
                <defs>
                    <filter id="displacement">
                        <feTurbulence
                            type="turbulence"
                            baseFrequency="0.008"
                            numOctaves="2"
                            seed={seed}
                            result="turbulence"
                        />
                        <feDisplacementMap
                            in2="turbulence"
                            in="SourceGraphic"
                            scale="5"
                        />
                       </filter>
                   </defs>
               </svg>
            <div className={className} style={{ filter: "url(#displacement)" }}>
                {children}
            </div>
        </>
    )
}

export default Wigglie