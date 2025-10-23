import {Router, Request, Response} from 'express';
import asyncHandler from "express-async-handler";
import {JobRequest} from "../controllers";
import {nearByMechanics,createJob} from "../middlewares/routes/job";

const jobRequest = Router();

jobRequest.get("/:jobId",asyncHandler(JobRequest.request));
jobRequest.get("/",asyncHandler(JobRequest.requests));

export default jobRequest;