import {Server} from "socket.io";
import {Job} from "bullmq";
import {WorkerConfig, IWorker} from "../types";
import {Namespaces, QueueType, UserType} from "../types/constants";
import Service from "../services/Service";
import {logger} from "../config";
import {notifications} from "../drizzle/schema";
import {db} from "../drizzle/drizzle";

export interface UpdateMessagesJob {
    messages: any[],
    room: string
}

const service = new Service();


export class Notification implements IWorker<any> {

    private io: Server;
    public config: WorkerConfig;
    public queueName = QueueType.NOTIFICATION;

    public constructor(config: WorkerConfig, io: Server) {
        this.io = io;
        this.config = config
    }

    public async process(job: Job<any>) {
        const {data, provider} = job.data;
        try {
            if (provider == "socket") {
                const notification = (await db.insert(notifications).values({
                    type: data.type,
                    data: data.data,
                    userId: data.userType == UserType.User ? data.userId : undefined,
                    mechanicId: data.userType == UserType.MECHANIC ? data.userId : undefined,

                }).returning())[0]
                const notificationNamespace = this.io.of(Namespaces.NOTIFICATION);
                notificationNamespace.to(data.userId).emit("notification", {
                    notification
                });

                logger.info(`🏃 Notifying ${data.userType}:${data.userId}, type:${data.type}`)
            }
        } catch (error) {
            service.handleDrizzleError(error)
        }
        return;
    }
}