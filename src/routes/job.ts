import {Router, Request, Response} from 'express';
import asyncHandler from "express-async-handler";
import {Job} from "../controllers";
import {nearByMechanics} from "../middlewares/routes/job";

const job = Router();

job.get("/near-by-mechanics/:lon/:lat",nearByMechanics,asyncHandler(Job.nearByMechanics));

export default job;