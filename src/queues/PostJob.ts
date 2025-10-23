import {Server} from "socket.io";
import {Job} from "bullmq";
import {WorkerConfig, IWorker} from "../types";
import {Namespaces, QueueType, UserType} from "../types/constants";
import Service from "../services/Service";
import {logger} from "../config";
import {jobRequests, notifications} from "../drizzle/schema";
import {db} from "../drizzle/drizzle";
import notify from "../services/notify";

export interface UpdateMessagesJob {
    messages: any[],
    room: string
}

const service = new Service();


export class PostJob implements IWorker<any> {

    private io: Server;
    public config: WorkerConfig;
    public queueName = QueueType.POST_JOB;

    public constructor(config: WorkerConfig, io: Server) {
        this.io = io;
        this.config = config
    }

    public async process(job: Job<any>) {
        const {mechanics, jobId,jobDetails} = job.data;
        try {
            const values = mechanics.map((mechanic: any) => ({
                jobId,
                mechanicId: mechanic.id,
            }));
            await db.insert(jobRequests).values(values);

            for (const mechanic of mechanics) {
              await notify({
                userId: mechanic.id,
                userType: UserType.MECHANIC,
                type: 'job',
                data: jobDetails,
              });
            }

        } catch (error) {
            service.handleDrizzleError(error)
        }
        return;
    }
}