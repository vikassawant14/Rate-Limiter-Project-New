import express from "express";

import {
    register,
    login
} from "../controllers/authController.js";

import loginRateLimiter from "../middleware/loginRateLimiter.js";

const router = express.Router();

router.post("/register", register);

router.post(
    "/login",
    loginRateLimiter,
    login
);

export default router;