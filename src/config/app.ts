import cors from "cors";
import http from 'http';
import express, {Application, NextFunction, Request, Response} from "express";
import morgan from "morgan";
import {env, initializeIO, logger} from ".";
import {RedisClientType} from "redis";
import {multerErrorHandler, validateJWT, verifyJWT} from "../middlewares";
import helmet from "helmet";
import {auth, job, user,mechanic} from "../routes";
import {UserType} from "../types/constants";
import {dummy} from "../drizzle/schema";
import {db} from "../drizzle/drizzle";
import {sql} from "drizzle-orm";
import {Email} from "../services";


export default async function createApp(pubClient: RedisClientType, subClient: RedisClientType) {
    const app: Application = express();
    const stream = {write: (message: string) => logger.http(message.trim())};
    const server = http.createServer(app);
    const io = await initializeIO(server, pubClient, subClient);

    app.use(helmet());
    app.set('trust proxy', 1); // For a single proxy (e.g., Render)
    app.use(express.urlencoded({extended: true}));
    app.use(cors());
    app.use(morgan("combined", {stream}));
    app.use(express.json());

    app.use("/api/v1/auth", auth);
    app.use("/api/v1/job", job);
    app.use("/api/v1/users", verifyJWT([UserType.User]), user);
    app.use("/api/v1/mechanics", verifyJWT([UserType.MECHANIC]), mechanic);


    app.post("/api/v1/test",async (req: Request, res: Response) => {
        const email = new Email();
        const templateData = {
            name: "userFullName",
            otpCode: "otpCode"
        };
        const emailContent = await email.getEmailTemplate(templateData);
        const mailResult = await email.sendEmail(
            "Ecommerce Api",
            "williamonyejiaka2021@gmail.com",
            "Testing",
            emailContent as string
        );



        res.status(200).json({
            error: false,
            message: "pinging api"
        });
        return;
    });

    app.post("/api/v1/test1",async (req: Request, res: Response) => {
        const {lon,lat,radiusKm} = req.body;

        const query = await db
            .select({
                id: dummy.id,
                name: dummy.name,
                email: dummy.email,
                location: dummy.location, // Optional: select as GeoJSON with sql`ST_AsGeoJSON(${users.location})`
            })
            .from(dummy)
            .where(
                // Raw SQL for spherical distance (in meters; divide by 1000 for km)
                sql`ST_DistanceSphere(${dummy.location}, ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326)) <= ${radiusKm * 1000}`
            )
            .orderBy(sql`ST_DistanceSphere(${dummy.location}, ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326))`); // Sort by distance

        res.status(200).json({
            error: false,
            message: "pinging api",
            data: query
        });
        return;
    });


    app.get("/ping", async (req: Request, res: Response) => {


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

    return {server, io};
}