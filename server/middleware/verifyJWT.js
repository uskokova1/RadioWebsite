const jwt = require("jsonwebtoken");

const verifyJWT = (req, res, next) => {
    //const authHeader = req.headers.authorization || req.headers.Authorization;
    const cookies = req.cookies;

    if(!cookies?.jwt_aT)
        {
        return res.status(401).send("Not authorized");
        }
    /*
    if (!authHeader?.startsWith("Bearer")) {
        return res.status(401).send("Not authorized");
    }
     */

    //const token = authHeader.split(" ")[1];
    const token = cookies.jwt_aT

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => {
            if (err) return res.status(403).json({message: "Forbidden"})
            req.user = decoded.UserInfo.username;
            req.role = decoded.UserInfo.role;
            next();
    })
}

module.exports = verifyJWT;