import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

/*Basically, NavBar is what it says, the little hamburger that can take you from place to place */

function NavBar() {
    const [open, setOpen] = useState(false);
    const location = useLocation();

    const links = [
        { to: "/Home",    icon: "⌂", label: "Home"    },
        { to: "/Blog",    icon: "✎", label: "Blogs"   },
        { to: "/Account", icon: "◉", label: "Account" },
    ];

    return (
        <>
            {/* 3 LINE BUTTON */}
            <button
                onClick={() => setOpen(!open)}
                style={{
                    ...styles.toggleBtn,
                    background: open ? "#2a2a2a" : "#322d2d",
                }}
            >
                <span style={styles.toggleIcon}>{open ? "✕" : "☰"}</span>
            </button>

            {/* LE BACKDROP */}
            {open && (
                <div
                    style={styles.backdrop}
                    onClick={() => setOpen(false)}
                />
            )}

            {/* LE SIDEBAR */}
            <nav style={{
                ...styles.sidebar,
                transform: open ? "translateX(0)" : "translateX(-100%)",
            }}>
                {/* WSIN phrase and logo */}
                <div style={styles.brand}>
                    <p style={styles.brandEyebrow}>TUNED INTO</p>
                    <p style={styles.brandTitle}>WSIN</p>
                    <div style={styles.brandLine} />
                </div>

                {/* NAV LINKS */}
                <div style={styles.linkList}>
                    {links.map(link => {
                        const active = location.pathname === link.to;
                        return (
                            <Link
                                key={link.to}
                                to={link.to}
                                onClick={() => setOpen(false)}
                                style={{
                                    ...styles.navLink,
                                    background: active ? "#241212" : "transparent",
                                    borderLeft: active ? "3px solid #fa4040" : "3px solid transparent",
                                    color: active ? "#fa4040" : "#888",
                                }}
                            >
                                <span style={styles.navIcon}>{link.icon}</span>
                                <span style={styles.navLabel}>{link.label}</span>
                            </Link>
                        );
                    })}
                </div>

                {/* FOOTER */}
                <div style={styles.sidebarFooter}>
                    <p style={styles.footerText}>WSIN RADIO</p>
                    <p style={styles.footerSub}>88.7 FM</p>
                </div>
            </nav>
        </>
    );
}

const styles = {
    toggleBtn: {
        position: "fixed",
        top: "20px",
        left: "20px",
        zIndex: 1000,
        border: "1px solid #3a3a3a",
        borderRadius: "6px",
        width: "44px",
        height: "44px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background 0.2s ease",
    },
    toggleIcon: {
        color: "#ff1212",
        fontSize: "18px",
        lineHeight: 1,
    },
    backdrop: {
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        zIndex: 998,
    },
    sidebar: {
        position: "fixed",
        top: 0,
        left: 0,
        width: "240px",
        height: "100vh",
        background: "#1a1a1a",
        borderRight: "1px solid #2a2a2a",
        zIndex: 999,
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.3s ease",
        boxShadow: "4px 0 30px rgba(0,0,0,0.6)",
    },
    brand: {
        padding: "36px 28px 24px",
        borderBottom: "1px solid #2a2a2a",
        background: "#322d2d",
    },
    brandEyebrow: {
        fontFamily: "'Courier New', monospace",
        fontSize: "9px",
        letterSpacing: "5px",
        color: "#fc8484",
        margin: "0 0 6px 0",
    },
    brandTitle: {
        fontFamily: "'Georgia', serif",
        fontSize: "36px",
        fontWeight: "bold",
        color: "#ff0000",
        margin: "0",
        letterSpacing: "-1px",
    },
    brandLine: {
        width: "30px",
        height: "2px",
        background: "#fc8484",
        marginTop: "12px",
    },
    linkList: {
        display: "flex",
        flexDirection: "column",
        padding: "20px 0",
        flex: 1,
    },
    navLink: {
        display: "flex",
        alignItems: "center",
        gap: "14px",
        padding: "14px 28px",
        textDecoration: "none",
        transition: "all 0.2s ease",
    },
    navIcon: {
        fontSize: "18px",
        width: "20px",
        textAlign: "center",
        flexShrink: 0,
    },
    navLabel: {
        fontFamily: "'Courier New', monospace",
        fontSize: "12px",
        letterSpacing: "3px",
    },
    sidebarFooter: {
        padding: "20px 28px",
        borderTop: "1px solid #2a2a2a",
    },
    footerText: {
        fontFamily: "'Courier New', monospace",
        fontSize: "9px",
        letterSpacing: "4px",
        color: "#333",
        margin: "0 0 2px 0",
    },
    footerSub: {
        fontFamily: "'Courier New', monospace",
        fontSize: "9px",
        letterSpacing: "4px",
        color: "#333",
        margin: "0",
    },
};

export default NavBar;
