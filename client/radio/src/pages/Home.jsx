import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { AppContext } from "../context/AppContext.jsx";

function Home() {
    const [playing, setPlaying] = useState(false);
    const [events, setEvents]   = useState([]);
    const navigate = useNavigate();

    const { backendUrl, userData } = useContext(AppContext);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const { data } = await axios.get(backendUrl + '/api/events');
                if (data.success) setEvents(data.events);
            } catch (err) {
                console.error('Failed to load events:', err.message);
            }
        };
        fetchEvents();
    }, []);

    return (
        <div className='min-h-1 flex justify-center bg-[#111]'>
            <div style={styles.column}>

                {/* HERO */}
                <div style={styles.hero}>
                    <div style={styles.heroInner}>
                        <p style={styles.heroEyebrow}>TUNED INTO</p>
                        <h1 style={styles.heroTitle}>WSIN<br />RADIO</h1>
                        <div style={styles.heroLine} />
                        <p style={styles.heroSub}>Rewind. Play. Repeat.</p>
                    </div>
                    <div style={styles.heroBadge}>1590 AM</div>

                    {/* Guard: userData can be false when not logged in */}
                    {userData && !userData.isAccountVerified && (
                        <button
                            onClick={() => navigate("/email-verify")}
                            className='text-l text-gray-800 bg-red-600 rounded-full p-1 absolute right-8 top-18 z-10 hover:scale-110 hover:font-bold'
                        >
                            Verify Account
                        </button>
                    )}
                </div>

                {/* ABOUT */}
                <div style={styles.card}>
                    <p style={styles.cardLabel}>ABOUT THE STATION</p>
                    <p style={styles.cardText}>
                        Welcome to <b>WSIN,</b> Southern Connecticut State University's
                        student-run radio station, broadcasting straight from Room 210 in the
                        Adanti Student Center! We bring you a <b>diverse mix of music, podcasts,
                        and student-led content,</b> making sure there's always something fresh to tune into.
                    </p>
                </div>

                {/* LIVE PLAYER */}
                <div style={styles.player}>
                    <div style={styles.playerLeft}>
                        <div style={{
                            ...styles.playerDot,
                            background: playing ? "#f87171" : "#555",
                            boxShadow: playing ? "0 0 10px #f87171" : "none",
                        }} />
                        <div>
                            <p style={styles.playerTrack}>
                                {playing ? "Live Stream — 1590 AM" : "Stream Offline"}
                            </p>
                            <p style={styles.playerSub}>
                                {playing ? "Now Playing: Nothing!" : "Tap to connect"}
                            </p>
                        </div>
                    </div>
                    <button
                        style={{ ...styles.playerBtn, background: playing ? "#c58484" : "#fa4040" }}
                        onClick={() => setPlaying(!playing)}
                    >
                        {playing ? "■ STOP" : "▶ PLAY"}
                    </button>
                </div>

                {/* UPCOMING EVENTS — live from MongoDB, newest 3 */}
                <div style={styles.eventsSection}>
                    <div style={styles.eventsSectionHeader}>
                        <p style={styles.cardLabel}>Upcoming Events</p>
                        <Link to="/Events" style={styles.eventsLink}>See All</Link>
                    </div>
                    {events.length === 0 ? (
                        <p style={styles.noEvents}>No Upcoming Events</p>
                    ) : (
                        <div style={styles.eventsRow}>
                            {events.slice(0, 3).map(ev => (
                                <div key={ev._id} style={styles.eventChip}>
                                    <div style={styles.eventChipBody}>
                                        <p style={styles.eventChipTitle}>{ev.title}</p>
                                        <p style={styles.eventChipDesc}>
                                            {ev.description?.slice(0, 80)}{ev.description?.length > 80 ? '...' : ''}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* BOTTOM NAV */}
                <div style={styles.bottomNav}>
                    <Link to="/Account" style={styles.navBtn}>
                        {userData ? "My Account" : "Log In"}
                    </Link>
                    <Link to="/Blog" style={styles.navBtn}>Blogs</Link>
                    <Link to="/Events" style={styles.navBtn}>Events</Link>
                </div>

            </div>
        </div>
    );
}

const styles = {
    column: {
        width: "100%",
        maxWidth: "760px",
        minHeight: "100vh",
        background: "#1a1a1a",
        display: "flex",
        flexDirection: "column",
        gap: "0",
        boxShadow: "0 0 60px rgba(0,0,0,0.8)",
        borderLeft: "1px solid #2a2a2a",
        borderRight: "1px solid #2a2a2a",
    },
    hero: {
        background: "#322d2d",
        padding: "48px 32px 36px",
        position: "relative",
        borderBottom: "1px solid #3a3a3a",
        overflow: "hidden",
    },
    heroInner: {
        position: "relative",
        zIndex: 1,
    },
    heroEyebrow: {
        fontFamily: "'Courier New', monospace",
        fontSize: "11px",
        letterSpacing: "6px",
        color: "#fc8484",
        margin: "0 0 12px 0",
    },
    heroTitle: {
        fontFamily: "'Georgia', serif",
        fontSize: "72px",
        fontWeight: "bold",
        color: "#ff0000",
        margin: "0",
        lineHeight: "1",
        letterSpacing: "-2px",
    },
    heroLine: {
        width: "60px",
        height: "3px",
        background: "#fc8484",
        margin: "20px 0",
    },
    heroSub: {
        fontFamily: "'Courier New', monospace",
        fontSize: "13px",
        color: "#888",
        margin: "0",
        letterSpacing: "2px",
    },
    heroBadge: {
        position: "absolute",
        top: "32px",
        right: "32px",
        fontFamily: "'Courier New', monospace",
        fontSize: "13px",
        color: "#fc8484",
        border: "1px solid #d33939",
        padding: "4px 10px",
        borderRadius: "2px",
        letterSpacing: "2px",
    },
    card: {
        padding: "28px 32px",
        borderBottom: "1px solid #2a2a2a",
    },
    cardLabel: {
        fontFamily: "'Courier New', monospace",
        fontSize: "10px",
        letterSpacing: "4px",
        color: "#555",
        margin: "0 0 12px 0",
    },
    cardText: {
        fontFamily: "'Georgia', serif",
        fontSize: "15px",
        color: "#aaa",
        lineHeight: "1.7",
        margin: "0",
    },
    player: {
        margin: "24px 32px",
        background: "#222",
        border: "1px solid #333",
        borderRadius: "8px",
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
    },
    playerLeft: {
        display: "flex",
        alignItems: "center",
        gap: "14px",
    },
    playerDot: {
        width: "10px",
        height: "10px",
        borderRadius: "50%",
        flexShrink: 0,
        transition: "all 0.3s ease",
    },
    playerTrack: {
        fontFamily: "'Courier New', monospace",
        fontSize: "12px",
        color: "#ddd",
        margin: "0 0 2px 0",
    },
    playerSub: {
        fontFamily: "'Courier New', monospace",
        fontSize: "10px",
        color: "#555",
        margin: "0",
    },
    playerBtn: {
        fontFamily: "'Courier New', monospace",
        fontSize: "11px",
        letterSpacing: "2px",
        color: "#fff",
        border: "none",
        borderRadius: "4px",
        padding: "8px 16px",
        cursor: "pointer",
        flexShrink: 0,
        transition: "background 0.2s ease",
    },
    //Events Styling
    eventsSection: {
        padding: "24px 32px",
        borderTop: "1px solid #2a2a2a"
    },
    eventsSectionHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "16px"
    },
    eventsLink: {
        fontFamily: "'Courier New', monospace",
        fontSize: "10px",
        color: "#fa4040",
        letterSpacing: "2px",
        textDecoration: "none"
    },
    noEvents: {
        fontFamily: "'Courier New', monospace",
        fontSize: "11px",
        color: "#333",
        letterSpacing: "2px"
    },
    eventsRow: {
        display: "flex",
        flexDirection: "column",
        gap: "12px"
    },
    eventChip: {
        display: "flex",
        gap: "14px",
        background: "#222",
        border: "1px solid #2e2e2e",
        borderRadius: "8px",
        overflow: "hidden",
    },
    eventChipThumb: {
        width: "80px",
        height: "80px",
        objectFit: "cover",
        flexShrink: 0
    },
    eventChipBody: {
        padding: "12px 14px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center"
    },
    eventChipTitle: {
        fontFamily: "'Georgia', serif",
        fontSize: "15px",
        color: "#f5f0e8",
        margin: "0 0 4px 0",
        fontWeight: "bold"
    },
    eventChipDesc: {
        fontFamily: "'Courier New', monospace",
        fontSize: "10px",
        color: "#666",
        margin: "0",
        letterSpacing: "1px"
    },


    bottomNav: {
        display: "flex",
        gap: "12px",
        padding: "24px 32px 48px",
        marginTop: "auto",
    },
    navBtn: {
        flex: 1,
        fontFamily: "'Courier New', monospace",
        fontSize: "11px",
        letterSpacing: "2px",
        color: "#aaa",
        background: "#222",
        border: "1px solid #333",
        borderRadius: "4px",
        padding: "12px 8px",
        cursor: "pointer",
        textAlign: "center",
        textDecoration: "none",
        transition: "all 0.2s ease",
    },
    navBtnAccent: {
        color: "#fa4040",
        borderColor: "#fc848433",
        background: "#241212",
    },
};

export default Home;

/*
import React from 'react'
import NavBar from '../components/NavBar'
import Header from "../components/Header.jsx";

const Home = () => {
    return (
        <div className='flex flex-col items-center justify-center min-h-screen'>
            <NavBar />
            <Header />
        </div>
    )
}
export default Home
 */