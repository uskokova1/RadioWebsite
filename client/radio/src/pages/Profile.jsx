import { useState, useContext } from "react";
import { AppContext } from "@/context/AppContext.jsx";
import axios from "axios";
import { toast } from "react-toastify";

function Profile() {
    const { userData, backendUrl, setUserData } = useContext(AppContext);

    const [displayName, setDisplayName] = useState(userData.displayName || userData.name || "");
    const [bio, setBio]                 = useState(userData.bio || "");
    const [stickers, setStickers]       = useState(userData.stickers || []);
    const [editing, setEditing]         = useState(false);
    const [saving, setSaving]           = useState(false);

    // sticker label input state — parallel array for the text labels
    const [stickerInputs, setStickerInputs] = useState(userData.stickers || []);

    const handleAddSticker = () => {
        setStickerInputs([...stickerInputs, ""]);
        setStickers([...stickers, ""]);
    };

    const handleStickerChange = (i, value) => {
        const updated = [...stickers];
        updated[i] = value;
        setStickers(updated);
    };

    const handleRemoveSticker = (i) => {
        setStickers(stickers.filter((_, idx) => idx !== i));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const { data } = await axios.put(
                backendUrl + '/api/user/profile',
                { displayName, bio, stickers },
                { withCredentials: true }
            );
            if (data.success) {
                setUserData(data.userData);
                toast.success("Profile saved");
                setEditing(false);
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        // reset to saved values
        setDisplayName(userData.displayName || userData.name || "");
        setBio(userData.bio || "");
        setStickers(userData.stickers || []);
        setEditing(false);
    };

    // avatar placeholder — initials circle
    const initials = (userData.displayName || userData.name || "?")[0].toUpperCase();

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
                    <div style={styles.avatarWrap}>
                        <span style={styles.avatarPlaceholder}>{initials}</span>
                        {editing && (
                            <div style={styles.avatarOverlay}>
                                <span style={styles.avatarOverlayText}>Soon™</span>
                            </div>
                        )}
                    </div>

                    <div style={styles.profileInfo}>
                        {editing ? (
                            <input
                                value={displayName}
                                onChange={e => setDisplayName(e.target.value)}
                                style={styles.nameInput}
                                placeholder="Display Name"
                            />
                        ) : (
                            <p style={styles.displayName}>{displayName || userData.name}</p>
                        )}
                        <p style={styles.profileUsername}>@{userData.name}</p>
                        <p style={styles.profileSub}>{userData.email}</p>
                        <p style={styles.profileRole}>{userData.role}</p>
                    </div>
                </div>

                {/* BIO */}
                <div style={styles.section}>
                    <p style={styles.sectionLabel}>BIO</p>
                    {editing ? (
                        <textarea
                            value={bio}
                            onChange={e => setBio(e.target.value)}
                            placeholder="Tell the station about yourself..."
                            style={styles.bioInput}
                        />
                    ) : (
                        <p style={styles.bioText}>{bio || "No bio yet."}</p>
                    )}
                </div>

                {/* STICKERS — dynamic */}
                <div style={styles.section}>
                    <p style={styles.sectionLabel}>STICKERS</p>
                    <p style={styles.sectionHint}>
                        {editing
                            ? "Add text labels as sticker placeholders. Image upload coming soon."
                            : stickers.length === 0 ? "No stickers added yet." : ""}
                    </p>

                    <div style={styles.stickerGrid}>
                        {stickers.map((sticker, i) => (
                            <div key={i} style={styles.stickerSlot}>
                                {editing ? (
                                    <>
                                        <input
                                            value={sticker}
                                            onChange={e => handleStickerChange(i, e.target.value)}
                                            placeholder={`Sticker ${i + 1}`}
                                            style={styles.stickerInput}
                                        />
                                        <button
                                            style={styles.stickerRemove}
                                            onClick={() => handleRemoveSticker(i)}
                                        >✕</button>
                                    </>
                                ) : (
                                    <div style={styles.stickerDisplay}>
                                        <span style={styles.stickerEmoji}>🏷️</span>
                                        <span style={styles.stickerLabel}>{sticker || `Sticker ${i + 1}`}</span>
                                    </div>
                                )}
                            </div>
                        ))}

                        {editing && (
                            <button style={styles.stickerAdd} onClick={handleAddSticker}>
                                <span style={styles.stickerAddText}>+ Add Sticker</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* ACTIONS */}
                <div style={styles.section}>
                    {editing ? (
                        <div style={styles.actionRow}>
                            <button style={styles.saveBtn} onClick={handleSave} disabled={saving}>
                                {saving ? "Saving..." : "Save Profile"}
                            </button>
                            <button style={styles.cancelBtn} onClick={handleCancel}>
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <button style={styles.editBtn} onClick={() => setEditing(true)}>
                            Edit Profile
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
}

const styles = {
    page:            { minHeight: "100vh", background: "#111", display: "flex", justifyContent: "center" },
    column:          { width: "100%", maxWidth: "760px", minHeight: "100vh", background: "#1a1a1a", display: "flex", flexDirection: "column", boxShadow: "0 0 60px rgba(0,0,0,0.8)", borderLeft: "1px solid #2a2a2a", borderRight: "1px solid #2a2a2a" },
    header:          { background: "#322d2d", padding: "40px 32px 28px", borderBottom: "1px solid #3a3a3a" },
    eyebrow:         { fontFamily: "'Courier New', monospace", fontSize: "10px", letterSpacing: "5px", color: "#fa4040", margin: "0 0 10px 0" },
    pageTitle:       { fontFamily: "'Georgia', serif", fontSize: "48px", fontWeight: "bold", color: "#f5f0e8", margin: "0", letterSpacing: "-1px" },
    titleLine:       { width: "40px", height: "3px", background: "#fa4040", marginTop: "16px" },
    profileTop:      { display: "flex", alignItems: "center", gap: "24px", padding: "32px 32px 24px", borderBottom: "1px solid #2a2a2a" },
    avatarWrap:      { width: "90px", height: "90px", borderRadius: "50%", background: "#322d2d", border: "2px solid #fa4040", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", flexShrink: 0 },
    avatarPlaceholder:{ fontFamily: "'Georgia', serif", fontSize: "36px", color: "#fa4040" },
    avatarOverlay:   { position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center" },
    avatarOverlayText:{ fontFamily: "'Courier New', monospace", fontSize: "9px", color: "#aaa", letterSpacing: "1px" },
    profileInfo:     { display: "flex", flexDirection: "column", gap: "3px" },
    displayName:     { fontFamily: "'Georgia', serif", fontSize: "24px", fontWeight: "bold", color: "#f5f0e8", margin: "0" },
    nameInput:       { fontFamily: "'Georgia', serif", fontSize: "22px", color: "#f5f0e8", background: "#222", border: "1px solid #444", borderRadius: "4px", padding: "6px 10px", outline: "none" },
    profileUsername: { fontFamily: "'Courier New', monospace", fontSize: "11px", color: "#fa4040", margin: "0", letterSpacing: "1px" },
    profileSub:      { fontFamily: "'Courier New', monospace", fontSize: "10px", color: "#555", margin: "0", letterSpacing: "1px" },
    profileRole:     { fontFamily: "'Courier New', monospace", fontSize: "9px", color: "#444", margin: "0", letterSpacing: "3px", textTransform: "uppercase" },
    section:         { padding: "24px 32px", borderBottom: "1px solid #2a2a2a" },
    sectionLabel:    { fontFamily: "'Courier New', monospace", fontSize: "9px", letterSpacing: "4px", color: "#555", margin: "0 0 8px 0" },
    sectionHint:     { fontFamily: "'Courier New', monospace", fontSize: "9px", color: "#444", letterSpacing: "1px", margin: "0 0 12px 0" },
    bioInput:        { fontFamily: "'Georgia', serif", fontSize: "14px", color: "#ccc", background: "#222", border: "1px solid #333", borderRadius: "4px", padding: "10px 12px", outline: "none", width: "100%", minHeight: "80px", resize: "vertical", boxSizing: "border-box" },
    bioText:         { fontFamily: "'Georgia', serif", fontSize: "15px", color: "#888", lineHeight: "1.7", margin: "0" },
    stickerGrid:     { display: "flex", flexWrap: "wrap", gap: "10px" },
    stickerSlot:     { position: "relative", display: "flex", alignItems: "center", gap: "6px" },
    stickerInput:    { fontFamily: "'Courier New', monospace", fontSize: "12px", color: "#f5f0e8", background: "#222", border: "1px solid #444", borderRadius: "4px", padding: "6px 10px", outline: "none", width: "130px" },
    stickerRemove:   { background: "#fa4040", border: "none", borderRadius: "50%", width: "18px", height: "18px", color: "#fff", fontSize: "9px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, flexShrink: 0 },
    stickerDisplay:  { display: "flex", alignItems: "center", gap: "6px", background: "#222", border: "1px solid #2e2e2e", borderRadius: "20px", padding: "5px 12px" },
    stickerEmoji:    { fontSize: "14px" },
    stickerLabel:    { fontFamily: "'Courier New', monospace", fontSize: "10px", color: "#aaa", letterSpacing: "1px" },
    stickerAdd:      { background: "#1a1a1a", border: "1px dashed #444", borderRadius: "20px", padding: "5px 14px", cursor: "pointer" },
    stickerAddText:  { fontFamily: "'Courier New', monospace", fontSize: "10px", color: "#555", letterSpacing: "2px" },
    actionRow:       { display: "flex", gap: "10px" },
    saveBtn:         { fontFamily: "'Courier New', monospace", fontSize: "11px", letterSpacing: "2px", color: "#fff", background: "#fa4040", border: "none", borderRadius: "4px", padding: "12px 24px", cursor: "pointer" },
    cancelBtn:       { fontFamily: "'Courier New', monospace", fontSize: "11px", letterSpacing: "2px", color: "#888", background: "transparent", border: "1px solid #444", borderRadius: "4px", padding: "12px 24px", cursor: "pointer" },
    editBtn:         { fontFamily: "'Courier New', monospace", fontSize: "11px", letterSpacing: "2px", color: "#fff", background: "#fa4040", border: "none", borderRadius: "4px", padding: "12px 24px", cursor: "pointer" },
};

export default Profile;