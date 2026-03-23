import dotenv from "dotenv"
import express from "express";
import connectDB from "./db/index.js";

const app = express();

dotenv.config({
    path: "./.env"
});

connectDB()
.then(
    app.listen(process.env.PORT, ()=> {
        console.log("Server is running : ", `http://localhost:${process.env.PORT}`)
       }
    )
)
.catch((error)=> {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1)
})

