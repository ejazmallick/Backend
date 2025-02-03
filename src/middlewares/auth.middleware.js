import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';

export const verifyJWT = asyncHandler(async (req, res, next) => {
   try {
     const token = req.cookies?.accessToken || req.headers.authorization?.replace("Bearer ", "");
 
     console.log("Token received:", token); // Log the token being processed
     console.log("Request headers:", req.headers); // Log the request headers
     console.log("Request cookies:", req.cookies); // Log the request cookies

     if (!token) {
         throw new ApiError(401, "Unauthorized request");
     }
 
     const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
 
     const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
 
     if (!user) {
         throw new ApiError(404, "Invalid access token");
     }
 
     req.user = user;
     next();
   } catch (error) {
        console.error("JWT verification error:", error); // Log the error
        throw new ApiError(401, error?.message || "Invalid access token");
   }
});
