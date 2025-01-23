import dotenv from "dotenv"
import express from "express"; 
import connectDB from "./db/index.js"; 
dotenv.config({
    path : "./.env"
})



const app = express();




connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000 , ()=> {
        console.log(` Server is Running at port : ${process.env.PORT}`);
        
    })
})
.catch((err)=> {
    console.log("MongoDB connection Failed!!!",err);
    
})




/*
import express from "express"
import connectDB from "./db"
const app = express()


( async()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error", (error)=>{
        console.log("ERRR:",error);
        throw err
        })

        app.listen(process.env.PORT, ()=>{
            console.log(`app is listening on port${process.env.PORT}`);
        })
        
    } catch (error) {
        console.error("ERROR:", error)
        throw err
    }
})()
    */
   