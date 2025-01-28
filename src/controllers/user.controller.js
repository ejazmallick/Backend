// import { asyncHandler } from "../utils/asyncHandler.js";
// import { User } from "../models/user.model.js"; // Import the User model

// const registerUser = asyncHandler(async (req, res) => {
//     const { username, email, fullName, password } = req.body;

//     // Validate input
//     if (!username || !email || !fullName || !password) {
//         return res.status(400).json({ message: "All fields are required." });
//     }

//     // Check for existing user
//     const existingUser = await User.findOne({ $or: [{ username }, { email }] });
//     if (existingUser) {
//         return res.status(400).json({ message: "Username or email already exists." });
//     }

//     // Create new user
//     try {
//         const newUser = await User.create({ username, email, fullName, password });

//         // Respond with success
//         res.status(201).json({
//             message: "User registered successfully.",
//             user: {
//                 id: newUser._id,
//                 username: newUser.username,
//                 email: newUser.email,
//                 fullName: newUser.fullName,
//             },
//         });
//     } catch (error) {
//         console.error("Error creating user:", error);
//         res.status(500).json({ message: "Internal server error." });
//     }
// });

// export {
//     registerUser,
// };


import { asyncHandler } from "../utils/asyncHandler.js";


const registerUser = asyncHandler(async (req, res) => {
    res.status(200).json({
        message: "ok"
    })
});
export {
    registerUser,
};

