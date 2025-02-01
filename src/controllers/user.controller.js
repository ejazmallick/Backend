import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js"; // Import the User model
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"; // Ensure this function is correctly implemented
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async(userId) => {
  try {
    const user= await User.findById(userId)
    const accessToken =  user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    user.save({ ValidateBeforeSave: false})

    return { accessToken, refreshToken };

  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating refresh and access tokens");
  }
}

const registerUser = asyncHandler(async (req, res) => {

   // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

  const { username, email, fullName, password } = req.body;
  console.log("email: ", email);
  console.log("Uploaded files: ", req.files); // Log the uploaded files

  if ([username, email, fullName, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required.");
  }

  const existingUser = await User.findOne({ $or: [{ username }, { email }] });

  if (existingUser) {
    throw new ApiError(409, "User with this email or username already exists");
  }

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path; // Ensure this matches the multer configuration

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = coverImageLocalPath ? await uploadOnCloudinary(coverImageLocalPath) : null;

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select("-password -refreshToken");

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res.status(201).json(new ApiResponse(200, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {

   // req body -> data
    // username or email
    //find the user
    //password check
    //access and referesh token
    //send cookie


  const { username, email, password } = req.body;

  if(!username && !email){
    throw new ApiError(400, "Username or email is required");
  }    

  const user = await User.findOne({ $or: [{ username }, { email: username }] });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordValid = await user.isPasswordValid(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid password");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  const options = {
    httpOnly: true,
    secure: true
  }

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "User logged in successfully"));
})

const logoutUser = asyncHandler(async (req, res) => {
  const accessToken = req.cookies.accessToken; // Define accessToken here

  await User.findByIdAndUpdate(
    req.user._id,
     { 
      refreshToken: undefined
    },
    {
      new: true,
    }
  );
  
  const options = {
    httpOnly: true,
    secure: true
  }
  return res
  .status(200)
  .clearCookie("accessToken", options) // Corrected method name
  .clearCookie("refreshToken", options) // Corrected method name
  .json(new ApiResponse(200, {}, "User logged out"));
})


const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if(!incomingRefreshToken){
      throw new ApiError(401, "Unauthorized Request");
    }
      
    try {
      const decodedToken = jwt.verify(incomingRefreshToken, process.REFRESH_TOKEN_SECRET);
  
  
  
      const user = await User.findById(decodedToken?._id);
  
      
      if(!user){
        throw new ApiError(401, "invalid Refresh token ");
      }
  
      if(incomingRefreshToken !== user.refreshToken){
        throw new ApiError(401, " refresh token is expired or used  ");
      }
  
      const options = {
        httpOnly: true,
        secure: true
      }
  
     const {accessToken , newRefreshToken }=  await generateAccessAndRefreshTokens(user._id);
  
     return res
     .status(200)
     .cookie("accessToken", accessToken, options)
     .cookie("refreshToken", newRefreshToken, options)
     .json(
      new ApiResponse(
        200,
        { accessToken, refreshToken: newRefreshToken },
        "Access token refreshed successfully"
      )
     )
    } catch (error) {
      throw new ApiError(401, error?.message || "invalid refresh token ");
      
    }
})



export {
   registerUser,
   loginUser,
   logoutUser,
   refreshAccessToken
};
