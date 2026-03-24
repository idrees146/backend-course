import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN
}))


app.use(express.json({limit: "16kb"})) // this is for limiting the size of the request body to 16kb
app.use(express.urlencoded({extended: true, limit: "16kb"})) // this is for parsing the urlencoded data and also limiting the size of the request body to 16kb
//this tells the backend how to handle the url based data

app.use(express.static("public")) // this is for serving static files from the public folder


app.use(cookieParser()) // this is for parsing the cookies from the request headers and making them available in the req.cookies object
//the cookie parser basic function is to set,remove cookie from the client's browser


//Routes
import userRoutes from "./routes/user.routes.js"

app.use("/api/v1/users", userRoutes) // this is for handling all the user related routes and also prefixing the routes with /api/v1/users


export {app}