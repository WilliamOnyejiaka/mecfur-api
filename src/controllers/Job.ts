import {Request, Response} from "express";
import Controller from "./Controller";
import {Job as Service} from "../services";


export default class Job {

    private static service = new Service();

    public static async nearByMechanics(req: Request, res: Response) {
        let {radius, page, limit} = req.query;
        let {lon, lat} = req.params;

        const parsedRadiusKm = parseInt(radius as string) || 50;
        const parsedPage = parseInt(page as string) || 1;
        const parsedLimit = parseInt(limit as string) || 10;

        const serviceResult = await Job.service.nearByMechanics(
            parseFloat(lon),
            parseFloat(lat),
            parsedRadiusKm,
            parsedPage,
            parsedLimit
        );
        Controller.response(res, serviceResult);
    }
}