import {Router, Request, Response} from 'express';
import asyncHandler from "express-async-handler";
import {Authentication} from "../controllers";
import {signUp, login, mechanicsValidator} from "../middlewares/routes/auth";

const auth = Router();

auth.post("/users/sign-up",signUp,asyncHandler(Authentication.create));
auth.post("/mechanics/sign-up",mechanicsValidator,asyncHandler(Authentication.createMechanic));

auth.get("/users/login",login,asyncHandler(Authentication.login));
auth.get("/mechanics/login",login,asyncHandler(Authentication.mechanicLogin));

export default auth;