import { useState, useEffect, useRef, useContext } from "react";
import { AppContext } from "../context/AppContext.jsx";
import axios from "axios";

const STREAM_URL = "https://broadcast.shoutcheap.com/proxy/wsinradi/stream";
const POLL_INTERVAL = 30000;

function Radio() {
    const { backendUrl } = useContext(AppContext);

    const [playing, setPlaying]   = useState(false);
    const [listeners, setListeners] = useState(null);
    const [isLive, setIsLive]     = useState(false);
    const [loading, setLoading]   = useState(false);

    const audioRef = useRef(null);

    const fetchStatus = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/stream/status');
            if (data.success) {
                setListeners(data.listeners ?? null);
                setIsLive(true);
            } else {
                setIsLive(false);
            }
        } catch {
            setIsLive(false);
        }
    };

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, POLL_INTERVAL);
        return () => clearInterval(interval);
    }, []);

    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;
        if (playing) {
            audio.pause();
            audio.src = "";
            setLoading(false);
        } else {
            setLoading(true);
            audio.src = STREAM_URL;
            audio.play()
                .then(() => setLoading(false))
                .catch(err => {
                    console.error("Stream error:", err);
                    setLoading(false);
                });
        }
        setPlaying(!playing);
    };

    return (
        <div style={styles.page}>
            <div style={styles.column}>

                {/* HEADER */}
                <div style={styles.header}>
                    <p style={styles.eyebrow}>WSIN RADIO</p>
                    <h2 style={styles.pageTitle}>Radio</h2>
                    <div style={styles.titleLine} />
                    <p style={styles.headerSub}>1590 AM · Southern Connecticut State University</p>
                </div>

                {/* LIVE BADGE + VISUALIZER */}
                <div style={styles.visualizerSection}>
                    <div style={styles.liveRow}>
                        <div style={{
                            ...styles.liveDot,
                            background: isLive ? "#fa4040" : "#555",
                            boxShadow: isLive ? "0 0 8px #fa4040" : "none",
                        }} />
                        <span style={{ ...styles.liveLabel, color: isLive ? "#fa4040" : "#777" }}>
                            {isLive ? "ON AIR" : "OFF AIR"}
                        </span>
                        {listeners !== null && (
                            <span style={styles.listenerCount}>
                                {listeners} listener{listeners !== 1 ? 's' : ''}
                            </span>
                        )}
                    </div>

                    <div style={styles.visualizer}>
                        {Array.from({ length: 20 }).map((_, i) => (
                            <div
                                key={i}
                                style={{
                                    ...styles.bar,
                                    animationDelay: `${(i * 0.08) % 1}s`,
                                    animationPlayState: playing ? "running" : "paused",
                                    height: playing ? undefined : "4px",
                                    opacity: playing ? 1 : 0.25,
                                }}
                            />
                        ))}
                    </div>
                </div>

                {/* PLAYER CONTROLS */}
                <div style={styles.playerSection}>
                    <audio ref={audioRef} preload="none" />
                    <button
                        style={{
                            ...styles.playBtn,
                            background: playing ? "#c58484" : "#fa4040",
                            opacity: loading ? 0.7 : 1,
                        }}
                        onClick={togglePlay}
                        disabled={loading}
                    >
                        {loading ? "CONNECTING..." : playing ? "■ STOP" : "▶ PLAY LIVE"}
                    </button>
                    <p style={styles.streamNote}>
                        {playing ? "Streaming live — 96kbps AAC" : "Tap to connect to the live stream"}
                    </p>
                </div>

                {/* STATION INFO */}
                <div style={styles.infoSection}>
                    <p style={styles.cardLabel}>STATION INFO</p>
                    <div style={styles.infoGrid}>
                        <div style={styles.infoItem}>
                            <span style={styles.infoLabel}>FREQUENCY</span>
                            <span style={styles.infoValue}>1590 AM</span>
                        </div>
                        <div style={styles.infoItem}>
                            <span style={styles.infoLabel}>FORMAT</span>
                            <span style={styles.infoValue}>College Radio</span>
                        </div>
                        <div style={styles.infoItem}>
                            <span style={styles.infoLabel}>BITRATE</span>
                            <span style={styles.infoValue}>96 kbps</span>
                        </div>
                        <div style={styles.infoItem}>
                            <span style={styles.infoLabel}>LOCATION</span>
                            <span style={styles.infoValue}>New Haven, CT</span>
                        </div>
                    </div>
                </div>

            </div>

            <style>{`
                @keyframes barPulse {
                    0%, 100% { height: 6px; }
                    50% { height: 36px; }
                }
            `}</style>
        </div>
    );
}

const OUTFIT = "'Outfit', sans-serif";
const MONO   = "'Courier New', monospace";
const SERIF  = "'Georgia', serif";

const styles = {
    page:              { minHeight: "100vh", background: "#111", display: "flex", justifyContent: "center" },
    column:            { width: "100%", maxWidth: "760px", minHeight: "100vh", background: "#1a1a1a", display: "flex", flexDirection: "column", boxShadow: "0 0 60px rgba(0,0,0,0.8)", borderLeft: "1px solid #2a2a2a", borderRight: "1px solid #2a2a2a" },

    header:            { background: "#322d2d", padding: "40px 32px 28px", borderBottom: "1px solid #3a3a3a" },
    eyebrow:           { fontFamily: MONO, fontSize: "10px", letterSpacing: "5px", color: "#fa4040", margin: "0 0 10px 0" },
    pageTitle:         { fontFamily: SERIF, fontSize: "48px", fontWeight: "bold", color: "#f5f0e8", margin: "0", letterSpacing: "-1px" },
    titleLine:         { width: "40px", height: "3px", background: "#fa4040", marginTop: "16px" },
    headerSub:         { fontFamily: OUTFIT, fontSize: "15px", color: "#bbb", margin: "14px 0 0 0" },

    visualizerSection: { padding: "36px 32px 28px", borderBottom: "1px solid #2a2a2a" },
    liveRow:           { display: "flex", alignItems: "center", gap: "10px", marginBottom: "28px" },
    liveDot:           { width: "10px", height: "10px", borderRadius: "50%", flexShrink: 0, transition: "all 0.4s ease" },
    liveLabel:         { fontFamily: MONO, fontSize: "12px", letterSpacing: "4px", fontWeight: "bold", transition: "color 0.4s ease" },
    listenerCount:     { fontFamily: OUTFIT, fontSize: "15px", color: "#bbb", marginLeft: "auto" },

    visualizer:        { display: "flex", alignItems: "flex-end", gap: "4px", height: "40px" },
    bar:               {
        flex: 1,
        background: "#fa4040",
        borderRadius: "2px 2px 0 0",
        minHeight: "4px",
        animation: "barPulse 0.8s ease-in-out infinite",
        transition: "height 0.3s ease, opacity 0.3s ease",
    },

    playerSection:     { padding: "32px 32px", borderBottom: "1px solid #2a2a2a", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "14px" },
    playBtn:           { fontFamily: MONO, fontSize: "12px", letterSpacing: "3px", color: "#fff", border: "none", borderRadius: "4px", padding: "14px 32px", cursor: "pointer", transition: "background 0.2s ease" },
    streamNote:        { fontFamily: OUTFIT, fontSize: "15px", color: "#bbb", margin: "0" },

    infoSection:       { padding: "32px 32px" },
    cardLabel:         { fontFamily: MONO, fontSize: "10px", letterSpacing: "4px", color: "#777", margin: "0 0 16px 0" },
    infoGrid:          { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" },
    infoItem:          { display: "flex", flexDirection: "column", gap: "6px" },
    infoLabel:         { fontFamily: MONO, fontSize: "9px", letterSpacing: "3px", color: "#777" },
    infoValue:         { fontFamily: OUTFIT, fontSize: "18px", fontWeight: "500", color: "#ddd" },
};

export default Radio;