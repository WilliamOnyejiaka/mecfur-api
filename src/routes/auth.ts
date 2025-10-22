import {Router, Request, Response} from 'express';
import asyncHandler from "express-async-handler";
import {Authentication} from "../controllers";
import {signUp,login} from "../middlewares/routes/auth";

const auth = Router();

auth.post("/sign-up",signUp,asyncHandler(Authentication.create));
auth.get("/login",login,asyncHandler(Authentication.login));


export default auth;