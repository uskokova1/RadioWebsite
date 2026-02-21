import { useState, useRef } from "react";


function Profile() {
    const [displayName, setDisplayName] = useState("Your Name");
    const [bio, setBio] = useState("");
    const [avatar, setAvatar] = useState(null);
    const [stickers, setStickers] = useState([null, null, null]);
    const [editing, setEditing] = useState(false);

    const avatarRef = useRef(null);
    const stickerRefs = useRef([null, null, null]);

    const handleAvatar = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => setAvatar(ev.target.result);
        reader.readAsDataURL(file);
    };

    const handleSticker = (index, e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const updated = [...stickers];
            updated[index] = ev.target.result;
            setStickers(updated);
        };
        reader.readAsDataURL(file);
    };

    const removeSticker = (index) => {
        const updated = [...stickers];
        updated[index] = null;
        setStickers(updated);
    };

    return (
        <div style={styles.page}>
            <div style={styles.column}>

                <div style={styles.header}>
                    <p style={styles.eyebrow}>WSIN RADIO</p>
                    <h2 style={styles.pageTitle}>Profile</h2>
                    <div style={styles.titleLine} />
                </div>

                {/* AVATAR + NAME */}
                <div style={styles.profileTop}>
                    <div style={styles.avatarWrap} onClick={() => editing && avatarRef.current.click()}>
                        {avatar
                            ? <img src={avatar} alt="avatar" style={styles.avatarImg} />
                            : <span style={styles.avatarPlaceholder}>?</span>
                        }
                        {editing && <div style={styles.avatarOverlay}>Edit</div>}
                    </div>
                    <input ref={avatarRef} type="file" accept="image/*" onChange={handleAvatar} style={{ display: "none" }} />

                    <div style={styles.profileInfo}>
                        {editing
                            ? <input
                                value={displayName}
                                onChange={e => setDisplayName(e.target.value)}
                                style={styles.nameInput}
                                placeholder="Display Name"
                            />
                            : <p style={styles.displayName}>{displayName}</p>
                        }
                        {/* db hook later: show username/email from /api/user/me */}
                        <p style={styles.profileSub}>@username</p>
                    </div>
                </div>

                {/* BIO */}
                <div style={styles.section}>
                    <p style={styles.sectionLabel}>BIO</p>
                    {editing
                        ? <textarea
                            value={bio}
                            onChange={e => setBio(e.target.value)}
                            placeholder="Tell the station about yourself..."
                            style={styles.bioInput}
                        />
                        : <p style={styles.bioText}>{bio || "No bio yet."}</p>
                    }
                </div>

                {/* STICKERS */}
                <div style={styles.section}>
                    <p style={styles.sectionLabel}>STICKERS (up to 3)</p>
                    <div style={styles.stickerRow}>
                        {stickers.map((sticker, i) => (
                            <div key={i} style={styles.stickerSlot}>
                                {sticker
                                    ? <>
                                        <img src={sticker} alt={`sticker ${i+1}`} style={styles.stickerImg} />
                                        {editing && (
                                            <button style={styles.stickerRemove} onClick={() => removeSticker(i)}>✕</button>
                                        )}
                                    </>
                                    : editing
                                        ? <div style={styles.stickerAdd} onClick={() => stickerRefs.current[i].click()}>
                                            <span style={styles.stickerAddText}>+</span>
                                        </div>
                                        : <div style={styles.stickerEmpty} />
                                }
                                <input
                                    ref={el => stickerRefs.current[i] = el}
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleSticker(i, e)}
                                    style={{ display: "none" }}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* EDIT / SAVE */}
                <div style={styles.section}>
                    <button
                        style={styles.editBtn}
                        onClick={() => setEditing(!editing)}
                    >
                        {editing ? "Save Profile" : "Edit Profile"}
                    </button>
                    {/* db hook later: on save, PUT /api/user/profile */}
                </div>

            </div>
        </div>
    );
}

const styles = {
    page: { minHeight: "100vh", background: "#111", display: "flex", justifyContent: "center" },
    column: {
        width: "100%", maxWidth: "760px", minHeight: "100vh", background: "#1a1a1a",
        display: "flex", flexDirection: "column",
        boxShadow: "0 0 60px rgba(0,0,0,0.8)",
        borderLeft: "1px solid #2a2a2a", borderRight: "1px solid #2a2a2a",
    },
    header: { background: "#322d2d", padding: "40px 32px 28px", borderBottom: "1px solid #3a3a3a" },
    eyebrow: { fontFamily: "'Courier New', monospace", fontSize: "10px", letterSpacing: "5px", color: "#fa4040", margin: "0 0 10px 0" },
    pageTitle: { fontFamily: "'Georgia', serif", fontSize: "48px", fontWeight: "bold", color: "#f5f0e8", margin: "0", letterSpacing: "-1px" },
    titleLine: { width: "40px", height: "3px", background: "#fa4040", marginTop: "16px" },
    profileTop: {
        display: "flex", alignItems: "center", gap: "24px",
        padding: "32px 32px 24px", borderBottom: "1px solid #2a2a2a",
    },
    avatarWrap: {
        width: "90px", height: "90px", borderRadius: "50%",
        background: "#322d2d", border: "2px solid #fa4040",
        display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative", overflow: "hidden", cursor: "pointer", flexShrink: 0,
    },
    avatarImg: { width: "100%", height: "100%", objectFit: "cover" },
    avatarPlaceholder: { fontFamily: "'Georgia', serif", fontSize: "32px", color: "#fa4040" },
    avatarOverlay: {
        position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Courier New', monospace", fontSize: "10px",
        color: "#fff", letterSpacing: "2px",
    },
    profileInfo: { display: "flex", flexDirection: "column", gap: "4px" },
    displayName: { fontFamily: "'Georgia', serif", fontSize: "24px", fontWeight: "bold", color: "#f5f0e8", margin: "0" },
    nameInput: {
        fontFamily: "'Georgia', serif", fontSize: "22px", color: "#f5f0e8",
        background: "#222", border: "1px solid #444", borderRadius: "4px",
        padding: "6px 10px", outline: "none",
    },
    profileSub: { fontFamily: "'Courier New', monospace", fontSize: "11px", color: "#555", margin: "0", letterSpacing: "2px" },
    section: { padding: "24px 32px", borderBottom: "1px solid #2a2a2a" },
    sectionLabel: { fontFamily: "'Courier New', monospace", fontSize: "9px", letterSpacing: "4px", color: "#555", margin: "0 0 12px 0" },
    bioInput: {
        fontFamily: "'Georgia', serif", fontSize: "14px", color: "#ccc",
        background: "#222", border: "1px solid #333", borderRadius: "4px",
        padding: "10px 12px", outline: "none", width: "100%", minHeight: "80px", resize: "vertical",
    },
    bioText: { fontFamily: "'Georgia', serif", fontSize: "15px", color: "#888", lineHeight: "1.7", margin: "0" },
    stickerRow: { display: "flex", gap: "16px" },
    stickerSlot: { position: "relative", width: "100px", height: "100px" },
    stickerImg: { width: "100%", height: "100%", objectFit: "cover", borderRadius: "10px", border: "1px solid #333" },
    stickerRemove: {
        position: "absolute", top: "-8px", right: "-8px",
        background: "#fa4040", border: "none", borderRadius: "50%",
        width: "20px", height: "20px", color: "#fff", fontSize: "10px",
        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0,
    },
    stickerAdd: {
        width: "100%", height: "100%", background: "#222", border: "1px dashed #444",
        borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
    },
    stickerAddText: { fontFamily: "'Courier New', monospace", fontSize: "24px", color: "#555" },
    stickerEmpty: { width: "100%", height: "100%", background: "#1a1a1a", border: "1px dashed #2a2a2a", borderRadius: "10px" },
    editBtn: {
        fontFamily: "'Courier New', monospace", fontSize: "11px", letterSpacing: "2px",
        color: "#fff", background: "#fa4040", border: "none", borderRadius: "4px",
        padding: "12px 24px", cursor: "pointer",
    },
};

export default Profile;