import { useState, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AccountBubble from "./AccountBubble.jsx";
import { Home } from "lucide-react";
import { AppContext } from "../context/AppContext.jsx";

function NavBar() {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { userData } = useContext(AppContext);

    const links = [
        { to: "/Home",                          icon: "⌂", label: "Home"    },
        { to: "/Radio",                         icon: "◎", label: "Radio"   },
        { to: "/Blog",                          icon: "✎", label: "Blogs"   },
        { to: "/Events",                        icon: "◈", label: "Events"  },
        { to: "/Contact",                       icon: "✉", label: "Contact" },
        { to: userData ? "/Profile" : "/login", icon: "◉", label: "Account" },
    ];

    return (
        <>
            <button
                style={{ ...styles.toggleBtn, left: '80px', display: open ? 'none' : 'flex', background: "#322d2d" }}
                onClick={() => navigate('/')}
                className='hover:scale-110 transition-all spring-bounce-60 spring-duration-300'
            >
                <Home className='text-red-500' />
            </button>

            <button
                onClick={() => setOpen(!open)}
                style={{ ...styles.toggleBtn, display: open ? 'none' : 'block', background: "#322d2d" }}
                className='hover:scale-110 transition-all spring-bounce-60 spring-duration-300'
            >
                <span style={styles.toggleIcon}>☰</span>
            </button>

            {open && <div style={styles.backdrop} onClick={() => setOpen(false)} />}

            <nav style={{ ...styles.sidebar, transform: open ? "translateX(0)" : "translateX(-100%)" }}>

                <div style={styles.brand}>
                    <p style={styles.brandEyebrow}>TUNED INTO</p>
                    <p style={styles.brandTitle}>WSIN</p>
                    <div style={styles.brandLine} />
                </div>

                <div style={styles.linkList}>
                    {links.map(link => {
                        const active = location.pathname === link.to;
                        return (
                            <div key={link.to} className='hover:bg-neutral-800 rounded-4xl'>
                                <Link
                                    to={link.to}
                                    onClick={() => setOpen(false)}
                                    style={{
                                        ...styles.navLink,
                                        background:  active ? "#241212"              : "transparent",
                                        borderLeft:  active ? "3px solid #fa4040"   : "3px solid transparent",
                                        color:       active ? "#fa4040"              : "#888",
                                    }}
                                >
                                    <span style={styles.navIcon}>{link.icon}</span>
                                    <span style={styles.navLabel}>{link.label}</span>
                                </Link>
                            </div>
                        );
                    })}
                </div>

                <div onClick={() => setOpen(false)} className='flex m-auto'>
                    <AccountBubble style={styles.profileFooter} />
                </div>

            </nav>
        </>
    );
}

const styles = {
    toggleBtn:    { position: "fixed", top: "20px", left: "20px", zIndex: 1000, border: "1px solid #3a3a3a", borderRadius: "6px", width: "44px", height: "44px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
    toggleIcon:   { color: "#ff1212", fontSize: "18px", lineHeight: 1 },
    backdrop:     { position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 998 },
    sidebar:      { position: "fixed", top: 0, left: 0, width: "240px", height: "100vh", background: "#1a1a1a", borderRight: "1px solid #2a2a2a", zIndex: 999, display: "flex", flexDirection: "column", transition: "transform 0.3s ease", boxShadow: "4px 0 30px rgba(0,0,0,0.6)" },
    brand:        { padding: "36px 28px 24px", borderBottom: "1px solid #2a2a2a", background: "#322d2d" },
    brandEyebrow: { fontFamily: "'Courier New', monospace", fontSize: "9px", letterSpacing: "5px", color: "#fc8484", margin: "0 0 6px 0" },
    brandTitle:   { fontFamily: "'Georgia', serif", fontSize: "36px", fontWeight: "bold", color: "#ff0000", margin: "0", letterSpacing: "-1px" },
    brandLine:    { width: "30px", height: "2px", background: "#fc8484", marginTop: "12px" },
    linkList:     { display: "flex", flexDirection: "column", padding: "20px 0", flex: 1 },
    navLink:      { display: "flex", alignItems: "center", gap: "14px", padding: "14px 28px", textDecoration: "none", transition: "all 0.2s ease", margin: '5px' },
    navIcon:      { fontSize: "22px", width: "20px", textAlign: "center", flexShrink: 0 },
    navLabel:     { fontFamily: "'Courier New', monospace", fontSize: "16px", letterSpacing: "3px" },
    profileFooter:{ display: "flex", alignItems: "center", gap: "12px", padding: "16px 20px", borderTop: "1px solid #2a2a2a", background: "#161616" },
};

export default NavBar;