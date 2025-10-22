import {Request, Response} from "express";
import Controller from "./Controller";
import {User as Service} from "../services";


export default class User {

    private static service = new Service();

    public static async profile(req: Request, res: Response) {
        const {id: userId} = res.locals.data;

        const serviceResult = await User.service.profile(userId);
        Controller.response(res, serviceResult);
    }
}