import React, {useEffect, useRef} from 'react'
import image from '../assets/library.jpg'
import depthMap from '../assets/library-depth.png'
import { useSpring } from "motion/react"


const DepthMap = () => {

    const width = 800;
    const height = 450;

    const tiltX = new useSpring(0, {stiffness: 50});
    const tiltY = new useSpring(0, {stiffness: 50});
    const displacementX = new useSpring(0, {stiffness: 50});
    const displacementY = new useSpring(0, {stiffness: 50});

    const cardContainer = useRef(null);
    const funcX = useRef(null)
    const funcY = useRef(null)

    function onMouseMove(e) {
        if (!cardContainer || !funcX || !funcY) return;

        const { clientX, clientY } = e;
        const { left, top } = cardContainer.current.getBoundingClientRect();

        const middleX = left + cardContainer.current.offsetWidth / 2;
        const middleY = top + cardContainer.current.offsetHeight / 2;

        const offsetX = clientX - middleX;
        const offsetY = clientY - middleY;

        const targetTiltX = (offsetX / middleX) * 10;
        const targetTiltY = (offsetY / middleY) * 10;

        // Update tweened values
        tiltX.set(targetTiltY);
        tiltY.set(targetTiltX);


        // Calculate and clamp displacement values
        const maxDisplacement = 0.1;
        const clampedOffsetX = Math.max(-maxDisplacement, Math.min(maxDisplacement, offsetX / middleX));
        const clampedOffsetY = Math.max(-maxDisplacement, Math.min(maxDisplacement, offsetY / middleY));

        displacementX.set(clampedOffsetX);
        displacementY.set(clampedOffsetY);
    }

    function onMouseLeave() {
        // Smoothly animate back to zero
        tiltX.set(0);
        tiltY.set(0);
        displacementX.set(0);
        displacementY.set(0);
    }

/*
    useEffect(() => {
        console.log("blah")
        if (cardContainer) {
            cardContainer.current.style.setProperty("--tilt-x", `${tiltY.get()}deg`);
            cardContainer.current.style.setProperty("--tilt-y", `${tiltX.get()}deg`);
        }

        if (funcX && funcY) {
            funcX.current.setAttribute("intercept", `${(displacementX.get() / 2) + 0.5}`);
            funcY.current.setAttribute("intercept", `${(displacementY.get() / 2) + 0.5}`);
            funcX.current.setAttribute("slope", `${displacementX.get()}`);
            funcY.current.setAttribute("slope", `${displacementY.get()}`);
        }
    }, [displacementX.get(),displacementY.get(),tiltY.get(),tiltX.get()])

 */
    useEffect(() => {
        const unsubscribeTiltX = tiltX.onChange((value) => {
            if (cardContainer.current) {
                cardContainer.current.style.setProperty(
                    '--tilt-x',
                    `${value}deg`
                );
            }
        });

        const unsubscribeTiltY = tiltY.onChange((value) => {
            if (cardContainer.current) {
                cardContainer.current.style.setProperty(
                    '--tilt-y',
                    `${value}deg`
                );
            }
        });
        const unsubscribeDisplacementX = displacementX.onChange((value) => {
            if (funcX.current) {
                funcX.current.setAttribute('intercept', `${(value / 2) + 0.5}`);
                funcX.current.setAttribute('slope', `${value}`);
            }
        });
        const unsubscribeDisplacementY = displacementY.onChange((value) => {
            if (funcY.current) {
                funcY.current.setAttribute('intercept', `${(value / 2) + 0.5}`);
                funcY.current.setAttribute('slope', `${value}`);
            }
        });
        // Cleanup subscriptions
        return () => {
            unsubscribeTiltX();
            unsubscribeTiltY();
            unsubscribeDisplacementX();
            unsubscribeDisplacementY();
        };
    }, [tiltX, tiltY, displacementX, displacementY]);

    return (
        <div
            className='absolute w-full grid h-full place-items-center'
            ref={cardContainer}
            onMouseLeave={onMouseLeave}
            onMouseMove={onMouseMove}
            style={{
                "--tilt-x": "0deg",
                "--tilt-y": "0deg",
                /* 3D tilt */
                "transform": "perspective(1000px) rotateX(var(--tilt-x, -15deg)) rotateY(var(--tilt-y, 0deg))",

                /* Put children onto separate 3D layers */
                "transformStyle": "preserve-3d"}}
        >
            <svg
                className="card-svg"
                width={width}
                height={height}
                viewBox={'0 0 '+ width +' ' +height}
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <filter id="displacement-3d">
                        <feImage href={depthMap} result="displacementMap" />

                        <feComponentTransfer in="displacementMap" result="scaled-displacement">
                            <feFuncR ref={funcX} type="linear" slope="0" intercept="0.5" />
                            <feFuncG ref={funcY} type="linear" slope="0" intercept="0.5" />
                        </feComponentTransfer>

                        <feDisplacementMap
                            in="SourceGraphic"
                            in2="scaled-displacement"
                            xChannelSelector="R"
                            yChannelSelector="G"
                            scale="100"
                            colorInterpolationFilters="sRGB"
                        />
                    </filter>
                </defs>
                <image
                    href={image}
                    filter="url(#displacement-3d)"
                    x="0"
                    y="0"
                    width={width}
                    height={height}
                />
            </svg>
        </div>
);
};

export default DepthMap;
