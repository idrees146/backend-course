import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger.js";
import { ApiError } from "./utils/ApiErrors.js";

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

app.use("/api/v1/users", userRoutes)


// Swagger API docs — visit http://localhost:8000/api-docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))


// Global error handler — catches all errors thrown via ApiError or unexpected errors
// Must be after all routes (Express identifies error handlers by the 4-param signature)
app.use((err, req, res, next) => {
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            errors: err.errors,
            data: null,
        });
    }

    // Unexpected errors
    console.error(err);
    return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        errors: [],
        data: null,
    });
});


export {app}
