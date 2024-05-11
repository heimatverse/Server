

// const Authentication = (req, res, next) => {
//     try {
//         // Extracting tokens from headers
//         const refreshToken = req.headers.authorization.split(" ")[1];
//         const accessToken = req.cookies.refreshToken;
//         console.log(refreshToken);
//         console.log(accessToken);
        

//         // Verifying access token
//         JWT.verify(accessToken, jwtSecret, (err, decodedAccessToken) => {
//             if (err) {
//                 // If access token is invalid
//                 return res.status(401).json({ message: "Access token is invalid or expired" });
//             } else {
//                 // If access token is valid, proceed to verify refresh token
//                 JWT.verify(refreshToken, Rtoken, (err, decodedRefreshToken) => {
//                     if (err) {
//                         // If refresh token is invalid
//                         return res.status(401).json({ message: "Refresh token is invalid or expired" });
//                     } else {
//                         // If both tokens are valid, proceed
//                         next();
//                     }
//                 });
//             }
//         });
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({ message: "Internal server error" });
//     }
// };
// module.exports = { Authentication };




const JWT = require("jsonwebtoken");
const jwtSecret = 'FallbackSecretKey';
const Rtoken = "refreshtokenkey";

const Authentication = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        
        if (token) {
            JWT.verify(token,jwtSecret, (err, decodedtoken) => {
                if (err) {
                    return res.status(401).json({ message: "you are unauthorized" });
                } else {
                    next();
                }
            });
        } else {
            return res.status(401).json({ message: "Token not found" });
        }
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = { Authentication };
