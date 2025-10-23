import {Queue} from 'bullmq';
import {env} from '.';
import {EnvKey} from "./env";
import {QueueType} from "../types/constants";

const connection = {url: env(EnvKey.REDIS_URL)!};

export const Queues = {
    notification: new Queue(QueueType.NOTIFICATION, {connection}),
    job: new Queue(QueueType.JOB, {connection}),
};