import {Router, Request, Response} from 'express';
import asyncHandler from "express-async-handler";
import {Job} from "../controllers";
import {nearByMechanics,createJob,acceptJob} from "../middlewares/routes/job";

const job = Router();

job.get("/accept/:requestId",acceptJob,asyncHandler(Job.acceptJob));
job.get("/near-by-mechanics/:lon/:lat",nearByMechanics,asyncHandler(Job.nearByMechanics));
job.post("/",createJob,asyncHandler(Job.createJob));


export default job;