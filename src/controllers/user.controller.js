import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js"; // Import the User model
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"; // Ensure this function is correctly implemented

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, fullName, password } = req.body;
  console.log("email: ", email);
  console.log("Uploaded files: ", req.files); // Log the uploaded files

  if ([username, email, fullName, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required.");
  }

  // Check if user already exists
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

export { registerUser };
