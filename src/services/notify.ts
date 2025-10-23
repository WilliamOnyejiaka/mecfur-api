import {logger} from "../config";
import {Queues} from "../config/bullMQ";

export enum NotificationProvider {
    Email = "email",
    SOCKET = "socket"
}

async function notify(data: any, provider: NotificationProvider = NotificationProvider.SOCKET) {
    try {
        await Queues.notification.add('notify', {data, provider}, {jobId: `send-${Date.now()}`, priority: 1});

    } catch (error) {
        console.log("Failed to publish notification: ", error);
    }
}

export default notify;