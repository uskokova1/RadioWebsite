import { useState } from "react";
import "../css/global.css";

function Account() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLogin, setIsLogin] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isLogin) {
            console.log("Logging in: ", username, password);
            // login logic - replace with db auth call later
            alert("Logged in!");
        } else {
            console.log("Creating Account: ", username, password);
            // creation logic - replace with db insert call later
            alert("Account Created!");
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.column}>

                {/* Big ol' header */}
                <div style={styles.header}>
                    <p style={styles.eyebrow}>WSIN RADIO</p>
                    <h2 style={styles.pageTitle}>{isLogin ? "Login" : "Create Account"}</h2>
                    <div style={styles.titleLine} />
                </div>

                {/* form thing */}
                <form onSubmit={handleSubmit} style={styles.form}>
                    <p style={styles.formLabel}>{isLogin ? "SIGN IN TO YOUR ACCOUNT" : "REGISTER A NEW ACCOUNT"}</p>

                    <div style={styles.fieldGroup}>
                        <label style={styles.fieldLabel}>USERNAME</label>
                        <input
                            type="text"
                            placeholder="Enter username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.fieldGroup}>
                        <label style={styles.fieldLabel}>PASSWORD</label>
                        <input
                            type="password"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={styles.input}
                        />
                    </div>

                    <button type="submit" style={styles.submitBtn}>
                        {isLogin ? "Login" : "Create Account"}
                    </button>
                </form>

                {/*toggle for stuff */}
                <div style={styles.toggleRow}>
                    <p style={styles.toggleText}>
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                    </p>
                    <button style={styles.toggleBtn} onClick={() => setIsLogin(!isLogin)}>
                        {isLogin ? "Sign Up" : "Login"}
                    </button>
                </div>

            </div>
        </div>
    );
}

/*I put styles in each page cause its easier if you wanna directly edit a component on da page if y'kna mean*/

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
    form: {
        margin: "32px 32px 0",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
    },
    formLabel: {
        fontFamily: "'Courier New', monospace",
        fontSize: "10px",
        letterSpacing: "4px",
        color: "#555",
        margin: "0",
    },
    fieldGroup: {
        display: "flex",
        flexDirection: "column",
        gap: "6px",
    },
    fieldLabel: {
        fontFamily: "'Courier New', monospace",
        fontSize: "9px",
        letterSpacing: "3px",
        color: "#555",
    },
    input: {
        fontFamily: "'Courier New', monospace",
        fontSize: "14px",
        color: "#f5f0e8",
        background: "#222",
        border: "1px solid #333",
        borderRadius: "4px",
        padding: "12px 14px",
        outline: "none",
        width: "100%",
        transition: "border-color 0.2s ease",
    },
    submitBtn: {
        fontFamily: "'Courier New', monospace",
        fontSize: "11px",
        letterSpacing: "2px",
        color: "#fff",
        background: "#fa4040",
        border: "none",
        borderRadius: "4px",
        padding: "14px",
        cursor: "pointer",
        marginTop: "4px",
        transition: "opacity 0.2s ease",
    },
    toggleRow: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "24px 32px",
    },
    toggleText: {
        fontFamily: "'Courier New', monospace",
        fontSize: "11px",
        color: "#555",
        margin: "0",
        letterSpacing: "1px",
    },
    toggleBtn: {
        fontFamily: "'Courier New', monospace",
        fontSize: "11px",
        letterSpacing: "2px",
        color: "#fa4040",
        background: "transparent",
        border: "1px solid #ff818143",
        borderRadius: "3px",
        padding: "6px 14px",
        cursor: "pointer",
        transition: "all 0.2s ease",
    },
};

export default Account;
