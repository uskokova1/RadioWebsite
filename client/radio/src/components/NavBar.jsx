import { useState } from "react";
import {Link, useLocation, useNavigate} from "react-router-dom";
import AccountBubble from "./AccountBubble.jsx";
import {Home} from "lucide-react"

const currentUser = {
    displayName: null,
    avatar: null,
};

function NavBar() {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const links = [
        { to: "/Home",    icon: "⌂", label: "Home"    },
        { to: "/Blog",    icon: "✎", label: "Blogs"   },
        { to: "/Events",  icon: "◈", label: "Events"  },
        { to: "/Contact", icon: "✉", label: "Contact" },
        { to: "/Account", icon: "◉", label: "Account" },
    ];

    return (
        <>

            <button style={{
                ...styles.toggleBtn,
                left: '80px',
                display: open ? 'none' : 'flex',
                background: open ? "#2a2a2a" : "#322d2d",
                }}
                    onClick={()=>navigate('/')}
                    className='hover:scale-110 transition-all spring-bounce-60 spring-duration-300'
            >
                <Home className='text-red-500'/>
            </button>

            <button
                onClick={() => setOpen(!open)}
                style={{
                    ...styles.toggleBtn,
                    display: open ? 'none' : 'block',
                    background: open ? "#2a2a2a" : "#322d2d",
                }}
                className='hover:scale-110 transition-all spring-bounce-60 spring-duration-300'
            >
                <span style={styles.toggleIcon}>{open ? "✕" : "☰"}</span>
            </button>


            {open && (
                <div
                    style={styles.backdrop}
                    onClick={() => setOpen(false)}
                />
            )}


            <nav style={{
                ...styles.sidebar,
                transform: open ? "translateX(0)" : "translateX(-100%)",
            }}>

                <div style={styles.brand} >
                    <p style={styles.brandEyebrow}>TUNED INTO</p>
                    <p style={styles.brandTitle}>WSIN</p>
                    <div style={styles.brandLine} />
                </div>


                <div style={styles.linkList}>
                    {links.map(link => {
                        const active = location.pathname === link.to;
                        return (
                            <div className='hover:bg-neutral-800 rounded-4xl'
                            >
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
                            </Link></div>
                        );
                    })}
                </div>

            <div onClick={() => setOpen(false)} className='flex m-auto'>
                <AccountBubble  style={styles.profileFooter}/>
            </div>
                {/*
                <Link
                    //to="/Profile"
                    //onClick={() => setOpen(false)}
                    style={styles.profileFooter}
                >

                    <div style = {styles.profileCircle}>
                        {currentUser.avatar
                            ? <img src = {currentUser.avatar} alt = "Avatar" style={styles.profileImg} />
                            : <span style = {styles.profileInitial}>?</span>
                        }
                    </div>
                    <div style = {styles.profileText}>
                        <p style = {styles.profileName}>
                            {currentUser.displayName || "Guest"}
                        </p>
                        <p style = {styles.profileSub}>
                            {currentUser.displayName ? "View Profile" : "Log In"}
                        </p>
                    </div>
                </Link>
                    */}
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
        //transition: "background 0.2s ease",
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
        alignContent: "center",
        margin: '5px',
    },
    navIcon: {
        fontSize: "22px",
        width: "20px",
        textAlign: "center",
        flexShrink: 0,
    },
    navLabel: {
        fontFamily: "'Courier New', monospace",
        fontSize: "16px",
        letterSpacing: "3px",
    },
    profileFooter: {
        display: "flex",
        alignItem: "center",
        gap: "12px",
        padding: "16px 20px",
        borderTop: "1px solid #2a2a2a",
        textDecoration: "none",
        transition: "background 0.2s ease",
        background: "#161616",
    },
    profileCircle: {
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        flexShrink: 0,
        background: "#322d2d",
        border: "2px solid #fa4040",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
    },
    profileImg: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
    },
    profileInitial: {
        fontFamily: "'Georgia', serif",
        fontSize: "16px",
        color: "#fa4040",
    },
    profileText: {
        display: "flex",
        flexDirection: "column",
        gap: "2px",
    },
    profileName: {
        fontFamily: "'Courier New', monospace",
        fontSize: "11px",
        color: "#ddd",
        margin: "0",
        letterSpacing: "1px",
    },
    profileSub: {
        fontFamily: "'Courier New', monospace",
        fontSize: "9px",
        color: "#555",
        margin: "0",
        letterSpacing: "2px",
    },
};

export default NavBar;