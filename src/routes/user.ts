import {Router, Request, Response} from 'express';
import asyncHandler from "express-async-handler";
import {User} from "../controllers";

const user = Router();

user.get("/",asyncHandler(User.profile));

export default user;