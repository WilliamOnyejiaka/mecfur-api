import cors from "cors";
import http from 'http';
import express, { Application, NextFunction, Request, Response } from "express";
import morgan from "morgan";
import { env, initializeIO, logger } from ".";
import { RedisClientType } from "redis";
import { multerErrorHandler, validateJWT, verifyJWT } from "../middlewares";
import helmet from "helmet";
import {auth,user} from "../routes";
import {UserType} from "../types/constants";


export default async function createApp(pubClient: RedisClientType, subClient: RedisClientType) {
    const app: Application = express();
    const stream = { write: (message: string) => logger.http(message.trim()) };
    const server = http.createServer(app);
    const io = await initializeIO(server, pubClient, subClient);

    app.use(helmet());
    app.set('trust proxy', 1); // For a single proxy (e.g., Render)
    app.use(express.urlencoded({ extended: true }));
    app.use(cors());
    app.use(morgan("combined", { stream }));
    app.use(express.json());

    app.use("/api/v1/auth", auth);
    app.use("/api/v1/user",verifyJWT([UserType.User]), user);


    app.get("/ping", (req: Request, res: Response) => {
        res.status(200).json({
            error: false,
            message: "pinging api"
        });
        return;
    });


    app.use(multerErrorHandler);
    app.use((req: Request, res: Response, next: NextFunction) => {
        console.warn(`Unmatched route: ${req.method} ${req.path}`);
        res.status(404).json({
            error: true,
            message: "Route not found. Please check the URL or refer to the API documentation.",
        })
    });

    return { server, io };
}