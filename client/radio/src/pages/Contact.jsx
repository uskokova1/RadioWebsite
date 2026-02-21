import { useState } from "react";


// ADD OR REMOVE MEMBERS HERE — just copy/paste a member object
const TEAM_MEMBERS = [
    {
        id: 1,
        name: "Gerryiki Williams",
        position: "General Manager",
        email: "gwilliams@wsinradio.org",
        link: "https://wsinradio.org",
        initials: "GW",
    },
    {
        id: 2,
        name: "Julio Merced",
        position: "Live Music Coordinator",
        email: "jm@wsinradio.org",
        link: null,
        initials: "JM",
    },
    {
        id: 3,
        name: "Ang Nappe",
        position: "Promotions Assistant",
        email: "anappe@wsinradio.org",
        link: null,
        initials: "SC",
    },
    {
        id: 4,
        name: "Kaiya Bryant",
        position: "Music Director",
        email: "kbryant@wsinradio.org",
        link: null,
        initials: "KB",
    },
];

function Contact() {
    const [selected, setSelected] = useState(null);

    return (
        <div style={styles.page}>
            <div style={styles.column}>

                {/* HEADER */}
                <div style={styles.header}>
                    <p style={styles.eyebrow}>WSIN RADIO</p>
                    <h2 style={styles.pageTitle}>Contact</h2>
                    <div style={styles.titleLine} />
                    <p style={styles.headerSub}>The people behind the signal.</p>
                </div>

                {/* MEMBER GRID */}
                <div style={styles.grid}>
                    {TEAM_MEMBERS.map(member => (
                        <MemberCard
                            key={member.id}
                            member={member}
                            onClick={() => setSelected(member)}
                        />
                    ))}
                </div>

            </div>

            {/* MODAL */}
            {selected && (
                <div style={styles.modalBackdrop} onClick={() => setSelected(null)}>
                    <div style={styles.modal} onClick={e => e.stopPropagation()}>
                        <button style={styles.modalClose} onClick={() => setSelected(null)}>✕</button>
                        <div style={styles.modalAvatar}>
                            <span style={styles.modalAvatarText}>{selected.initials}</span>
                        </div>
                        <p style={styles.modalName}>{selected.name}</p>
                        <p style={styles.modalPosition}>{selected.position}</p>
                        <div style={styles.modalDivider} />
                        <div style={styles.modalField}>
                            <span style={styles.modalFieldLabel}>EMAIL</span>
                            <a href={`mailto:${selected.email}`} style={styles.modalFieldValue}>
                                {selected.email}
                            </a>
                        </div>
                        {selected.link && (
                            <div style={styles.modalField}>
                                <span style={styles.modalFieldLabel}>LINK</span>
                                <a href={selected.link} target="_blank" rel="noreferrer" style={styles.modalFieldValue}>
                                    {selected.link}
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function MemberCard({ member, onClick }) {
    const [hovered, setHovered] = useState(false);

    return (
        <div
            style={{
                ...styles.card,
                transform: hovered ? "translateY(-6px) scale(1.02)" : "translateY(0) scale(1)",
                boxShadow: hovered ? "0 12px 32px rgba(0,0,0,0.5)" : "0 2px 8px rgba(0,0,0,0.3)",
                borderColor: hovered ? "#fa4040" : "#2e2e2e",
                cursor: "pointer",
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={onClick}
        >
            <div style={styles.avatar}>
                <span style={styles.avatarText}>{member.initials}</span>
            </div>
            <p style={styles.cardName}>{member.name}</p>
            <p style={styles.cardPosition}>{member.position}</p>
            <p style={{
                ...styles.cardHint,
                opacity: hovered ? 1 : 0,
            }}>click for info</p>
        </div>
    );
}

const styles = {
    page: {
        minHeight: "100vh",
        background: "#111",
        display: "flex",
        justifyContent: "center",
    },
    column: {
        width: "100%",
        maxWidth: "760px",
        minHeight: "100vh",
        background: "#1a1a1a",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 0 60px rgba(0,0,0,0.8)",
        borderLeft: "1px solid #2a2a2a",
        borderRight: "1px solid #2a2a2a",
    },
    header: {
        background: "#322d2d",
        padding: "40px 32px 28px",
        borderBottom: "1px solid #3a3a3a",
    },
    eyebrow: {
        fontFamily: "'Courier New', monospace",
        fontSize: "10px",
        letterSpacing: "5px",
        color: "#fa4040",
        margin: "0 0 10px 0",
    },
    pageTitle: {
        fontFamily: "'Georgia', serif",
        fontSize: "48px",
        fontWeight: "bold",
        color: "#f5f0e8",
        margin: "0",
        letterSpacing: "-1px",
    },
    titleLine: {
        width: "40px",
        height: "3px",
        background: "#fa4040",
        marginTop: "16px",
    },
    headerSub: {
        fontFamily: "'Courier New', monospace",
        fontSize: "11px",
        color: "#555",
        letterSpacing: "2px",
        margin: "14px 0 0 0",
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
        gap: "20px",
        padding: "32px",
    },
    card: {
        background: "#222",
        border: "1px solid #2e2e2e",
        borderRadius: "12px",
        padding: "24px 16px 20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        transition: "all 0.2s ease",
        userSelect: "none",
    },
    avatar: {
        width: "64px",
        height: "64px",
        borderRadius: "50%",
        background: "#322d2d",
        border: "2px solid #fa4040",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "14px",
    },
    avatarText: {
        fontFamily: "'Courier New', monospace",
        fontSize: "18px",
        color: "#fa4040",
        fontWeight: "bold",
    },
    cardName: {
        fontFamily: "'Georgia', serif",
        fontSize: "14px",
        color: "#f5f0e8",
        margin: "0 0 4px 0",
        textAlign: "center",
        fontWeight: "bold",
    },
    cardPosition: {
        fontFamily: "'Courier New', monospace",
        fontSize: "9px",
        color: "#666",
        letterSpacing: "2px",
        margin: "0",
        textAlign: "center",
    },
    cardHint: {
        fontFamily: "'Courier New', monospace",
        fontSize: "8px",
        color: "#fa4040",
        letterSpacing: "2px",
        margin: "10px 0 0 0",
        transition: "opacity 0.2s ease",
    },
    // MODAL
    modalBackdrop: {
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
    },
    modal: {
        background: "#1a1a1a",
        border: "1px solid #333",
        borderRadius: "16px",
        padding: "40px 36px 32px",
        width: "320px",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        boxShadow: "0 24px 60px rgba(0,0,0,0.8)",
    },
    modalClose: {
        position: "absolute",
        top: "16px",
        right: "16px",
        background: "transparent",
        border: "1px solid #333",
        borderRadius: "50%",
        width: "28px",
        height: "28px",
        color: "#666",
        cursor: "pointer",
        fontSize: "12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
    },
    modalAvatar: {
        width: "80px",
        height: "80px",
        borderRadius: "50%",
        background: "#322d2d",
        border: "2px solid #fa4040",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "16px",
    },
    modalAvatarText: {
        fontFamily: "'Courier New', monospace",
        fontSize: "24px",
        color: "#fa4040",
        fontWeight: "bold",
    },
    modalName: {
        fontFamily: "'Georgia', serif",
        fontSize: "22px",
        color: "#f5f0e8",
        margin: "0 0 6px 0",
        fontWeight: "bold",
        textAlign: "center",
    },
    modalPosition: {
        fontFamily: "'Courier New', monospace",
        fontSize: "10px",
        color: "#fa4040",
        letterSpacing: "3px",
        margin: "0",
        textAlign: "center",
    },
    modalDivider: {
        width: "100%",
        height: "1px",
        background: "#2a2a2a",
        margin: "20px 0",
    },
    modalField: {
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        marginBottom: "14px",
    },
    modalFieldLabel: {
        fontFamily: "'Courier New', monospace",
        fontSize: "9px",
        letterSpacing: "3px",
        color: "#444",
    },
    modalFieldValue: {
        fontFamily: "'Courier New', monospace",
        fontSize: "12px",
        color: "#aaa",
        textDecoration: "none",
        wordBreak: "break-all",
    },
};

export default Contact;