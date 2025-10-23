import { Server } from "socket.io";
import { Job } from "bullmq";
import {  WorkerConfig, IWorker } from "../types";
import {QueueType} from "../types/constants";

export interface UpdateMessagesJob {
    messages: any[],
    room: string
}


export class Notification implements IWorker<any> {

    private io: Server;
    public config: WorkerConfig;
    public queueName = QueueType.NOTIFICATION;

    public constructor(config: WorkerConfig, io: Server) {
        this.io = io;
        this.config = config
    }

    public async process(job: Job<any>) {
        console.log(job.data)
        // const { recipientSocketId, recipientId, recipientType } = job.data;
        //
        // const result = await this.facade.chatService.getUserChats(recipientId, recipientType, 1, 10, ServiceResultDataType.SOCKET) as SocketData;
        // const namespace = this.io.of(Namespaces.CHAT);
        // if (result.error) {
        //     namespace.to(recipientSocketId).emit(Events.APP_ERROR, result);
        //     return;
        // }
        //
        // namespace.to(recipientSocketId).emit('updateChat', Handler.responseData(200, false, result.message, result.data));
        return;
    }
}