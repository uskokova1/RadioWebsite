import { useState } from "react";
import { useNavigate } from "react-router-dom";


function Account() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLogin, setIsLogin] = useState(false);
    const [showForgot, setShowForgot] = useState(false);
    const [forgotEmail, setForgotEmail] = useState("");
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isLogin) {
            console.log("Logging in: ", username, password);
            // login logic - replace with db auth call later
            alert("Logged in!");
            navigate("/Home");
        } else {
            console.log("Creating Account: ", username, password);
            // creation logic - replace with db insert call later
            alert("Account Created!");
            navigate("/Profile");
        }
    };

    //forgotten password
    const handleForgot = (e) => {
        e.preventDefault();
        //db hook up later: api/auth/forgot-pass or sum like that
        alert(`Reset link sent to ${forgotEmail}`);
        setShowForgot(false);
        setForgotEmail("");
    };

    const handleGoogle = () => {
        //db hook up later
        alert("Google OAuth not connected yet.");
    };

    return (
        <div style={styles.page}>
            <div style={styles.column}>

                <div style={styles.header}>
                    <p style={styles.eyebrow}>WSIN RADIO</p>
                    <h2 style={styles.pageTitle}>{showForgot ? "Reset Password" : isLogin ? "Login" : "Create Account"}</h2>
                    <div style={styles.titleLine} />
                </div>

                {showForgot ? (
                    <form onSubmit={handleForgot} style={styles.form}>
                        <p style={styles.formLabel}>ENTER YOUR EMAIL</p>
                        <div style={styles.fieldGroup}>
                            <label style={styles.fieldLabel}>EMAIL</label>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={forgotEmail}
                                onChange={e => setForgotEmail(e.target.value)}
                                style={styles.input}
                            />
                        </div>
                        <button type="submit" style={styles.submitBtn}>Send Reset Link</button>
                        <button type="button" style={styles.backBtn} onClick={() => setShowForgot(false)}>
                            ← Back to Login
                        </button>
                    </form>
                ) : (
                    <>
                        <div style={styles.oauthSection}>
                            <button style={styles.googleBtn} onClick={handleGoogle}>
                                <span style={styles.googleIcon}>G</span>
                                {isLogin ? "Sign in with Google" : "Sign up with Google"}
                            </button>
                            <div style={styles.dividerRow}>
                                <div style={styles.dividerLine} />
                                <span style={styles.dividerText}>or</span>
                                <div style={styles.dividerLine} />
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} style={styles.form}>
                            <p style={styles.formLabel}>{isLogin ? "SIGN IN TO YOUR ACCOUNT" : "REGISTER A NEW ACCOUNT"}</p>

                            <div style={styles.fieldGroup}>
                                <label style={styles.fieldLabel}>EMAIL</label>
                                <input
                                    type="text"
                                    placeholder="Enter email"
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

                            {isLogin && (
                                <button type="button" style={styles.forgotBtn} onClick={() => setShowForgot(true)}>
                                    Forgot password?
                                </button>
                            )}

                            <button type="submit" style={styles.submitBtn}>
                                {isLogin ? "Login" : "Create Account"}
                            </button>
                        </form>

                        <div style={styles.toggleRow}>
                            <p style={styles.toggleText}>
                                {isLogin ? "Don't have an account?" : "Already have an account?"}
                            </p>
                            <button style={styles.toggleBtn} onClick={() => setIsLogin(!isLogin)}>
                                {isLogin ? "Sign Up" : "Login"}
                            </button>
                        </div>
                    </>
                )}

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
        justifyContent: "center"
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
        borderBottom: "1px solid #3a3a3a"
    },
    eyebrow: {
        fontFamily: "'Courier New', monospace",
        fontSize: "10px",
        letterSpacing: "5px",
        color: "#fa4040",
        margin: "0 0 10px 0"
    },
    pageTitle: {
        fontFamily: "'Georgia', serif",
        fontSize: "48px",
        fontWeight: "bold",
        color: "#f5f0e8",
        margin: "0",
        letterSpacing: "-1px"
    },
    titleLine: {
        width: "40px",
        height: "3px",
        background: "#fa4040",
        marginTop: "16px"
    },
    oauthSection: {
        padding: "28px 32px 0"
    },
    googleBtn: {
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        fontFamily: "'Courier New', monospace",
        fontSize: "11px",
        letterSpacing: "2px",
        color: "#ddd",
        background: "#222",
        border: "1px solid #444",
        borderRadius: "4px",
        padding: "12px",
        cursor: "pointer",
    },
    googleIcon: {
        fontFamily: "'Georgia', serif",
        fontSize: "16px",
        fontWeight: "bold",
        color: "#fa4040",
        lineHeight: 1
    },
    dividerRow: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        margin: "20px 0 0"
    },
    dividerLine: {
        flex: 1,
        height: "1px",
        background: "#2a2a2a"
    },
    dividerText: {
        fontFamily: "'Courier New', monospace",
        fontSize: "10px",
        color: "#444",
        letterSpacing: "2px"
    },
    form: {
        margin: "20px 32px 0",
        display: "flex",
        flexDirection: "column",
        gap: "20px"
    },
    formLabel: {
        fontFamily: "'Courier New', monospace",
        fontSize: "10px",
        letterSpacing: "4px",
        color: "#555",
        margin: "0"
    },
    fieldGroup: {
        display: "flex",
        flexDirection: "column",
        gap: "6px"
    },
    fieldLabel: {
        fontFamily: "'Courier New', monospace",
        fontSize: "9px",
        letterSpacing: "3px",
        color: "#555"
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
    },
    forgotBtn: {
        fontFamily: "'Courier New', monospace",
        fontSize: "10px",
        letterSpacing: "1px",
        color: "#666",
        background: "transparent",
        border: "none",
        padding: "0",
        cursor: "pointer",
        textAlign: "left",
        alignSelf: "flex-start",
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
    },
    backBtn: {
        fontFamily: "'Courier New', monospace",
        fontSize: "10px",
        color: "#666",
        background: "transparent",
        border: "none",
        padding: "0",
        cursor: "pointer",
    },
    toggleRow: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "24px 32px"
    },
    toggleText: {
        fontFamily: "'Courier New', monospace",
        fontSize: "11px",
        color: "#555",
        margin: "0",
        letterSpacing: "1px"
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
    },
};

export default Account;
