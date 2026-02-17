import { useState } from "react";

function Account() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLogin, setIsLogin] = useState(false);


    const handleSubmit = (e) => {
        e.preventDefault();
        if (isLogin) {
            console.log("Logging in: ", username, password);
            alert("Logged in!");
        } else {
            console.log("Creating Account: ", username, password);
            alert("Account Created!")
        }
    };


    return(
        <>
            <div>
                <h2>{isLogin ? "Login" : "Create an Account"}</h2>
            </div>
            <form onSubmit={handleSubmit}>
                <div>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div>
                    <input
                        type="text"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <button type="submit">
                    {isLogin ? "Login" : "Create Account"}
                </button>
            </form>

            <p>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button onClick={() => setIsLogin(!isLogin)}>
                    {isLogin ? "Sign Up" : "Login"}
                </button>
            </p>
        </>
    );
}

export default Account