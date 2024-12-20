import jwt from 'jsonwebtoken'

function authMiddleware(req,res,next) {
    const token = req.headers['authorization'];

    if(!token){return res.status(401).json({message:"no token provided"})}

    // token is available
    jwt.verify(token,process.env.JWT_SECRET_KEY,(err,decoded) => {
        if(err){return res.status(401).json({message:"invalid token"})}

        // decode the jwt token
        req.userId = decoded.id;
        next();
    })
}

export default authMiddleware;