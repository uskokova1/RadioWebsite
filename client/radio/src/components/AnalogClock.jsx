import React from 'react';

function AnalogClock({ hours = 12, minutes = 0 }) {
    const hourDeg = (hours % 12) * 30 + minutes * 0.5;
    const minDeg = minutes * 6;

    return (
        <div
            style={{ ...styles.clock, position: 'relative', width: 160, height: 160 }}
        >
            {/* Hour markers */}
            {[...Array(12)].map((_, i) => (
                <div
                    key={i}
                    style={{
                        ...styles.marker,
                        transform: `rotate(${i * 30}deg)`,
                    }}
                />
            ))}

            {/* Hour hand */}
            <div
                style={{
                    ...styles.hand, ...styles.hourHand,
                    transform: `rotate(${hourDeg}deg)`,
                }}
            />

            {/* Minute hand */}
            <div
                style={{
                    ...styles.hand, ...styles.minuteHand,
                    transform: `rotate(${minDeg}deg)`,
                }}
            />

            {/* Center dot */}
            <div style={styles.centerDot} />
        </div>
    );
}

const styles = {
    clock: {
        borderRadius: '50%',
        background: '#1a1a1a',
        border: '2px solid #fa4040',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    marker: {
        position: 'absolute',
        width: 2,
        height: '100%',
        left: '50%',
        top: 0,
        transformOrigin: 'center center',
        marginLeft: -1,
    },
    hand: {
        position: 'absolute',
        left: '50%',
        bottom: '50%',
        transformOrigin: 'center bottom',
        borderRadius: '2px',
    },
    hourHand: {
        width: 4,
        height: 40,
        marginLeft: -2,
        background: '#e0e0e0',
    },
    minuteHand: {
        width: 2,
        height: 55,
        marginLeft: -1,
        background: '#fa4040',
    },
    centerDot: {
        position: 'absolute',
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: '#fa4040',
        zIndex: 10,
    },
};

export default AnalogClock;
