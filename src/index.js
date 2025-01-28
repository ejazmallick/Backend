import dotenv from "dotenv";
import express from "express"; 
import connectDB from "./db/index.js"; 
import { app } from "./app.js"; // Import the app instance

dotenv.config({
    path: "./.env"
});

connectDB()
    .then(() => {
        app.listen(process.env.PORT || 8000, () => {
            console.log(`Server is Running at port: ${process.env.PORT}`);
        });
    })
    .catch((err) => {
        console.log("MongoDB connection Failed!!!", err);
    });
