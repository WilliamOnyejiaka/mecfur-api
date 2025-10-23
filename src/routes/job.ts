import {Router, Request, Response} from 'express';
import asyncHandler from "express-async-handler";
import {Job} from "../controllers";
import {nearByMechanics,createJob} from "../middlewares/routes/job";

const job = Router();

job.get("/near-by-mechanics/:lon/:lat",nearByMechanics,asyncHandler(Job.nearByMechanics));
job.post("/",createJob,asyncHandler(Job.createJob));


export default job;