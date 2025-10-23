import {Request, Response} from "express";
import Controller from "./Controller";
import {JobRequest as Service} from "../services";


export default class JobRequest {

    private static service = new Service();

    public static async request(req: Request, res: Response) {
        const {id: userId} = res.locals.data;
        const {jobId} = req.params;

        const serviceResult = await JobRequest.service.request(userId, jobId);
        Controller.response(res, serviceResult);
    }

    public static async requests(req: Request, res: Response) {
        const {id: userId} = res.locals.data;
        const {page, limit} = req.query;

        const parsedPage = parseInt(page as string) || 1;
        const parsedLimit = parseInt(limit as string) || 10;

        const serviceResult = await JobRequest.service.requests(userId, parsedPage, parsedLimit);
        Controller.response(res, serviceResult);
    }
}