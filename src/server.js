import "dotenv/config";

import express from "express";

import path from "path";
import { fileURLToPath } from "url";

import { connectRedis } from "./config/redis.js";
import { connectMySQL } from "./config/mysql.js";

import rateLimiter from "./middleware/rateLimiter.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";


const app = express();


// Get current file directory
const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);


// Public folder
const publicPath = path.join(__dirname, "../public");

app.use(express.static(publicPath));


// JSON requests
app.use(express.json());


// General rate limiter
app.use(rateLimiter);


// Home page
app.get("/", (req, res) => {

    res.sendFile(
        path.join(publicPath, "index.html")
    );

});


// Authentication routes
app.use("/api/auth", authRoutes);


// Protected user routes
app.use("/api/users", userRoutes);


const PORT = process.env.PORT || 5000;


const startServer = async () => {

    try {

        await connectRedis();

        await connectMySQL();

        app.listen(PORT, () => {

            console.log(`Server running on http://localhost:${PORT}`);

        });

    } catch (error) {

        console.error(
            "Server startup failed:",
            error.message
        );

    }

};

startServer();