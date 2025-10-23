import {createApp, env, redisClient} from "./config";
import cron from "node-cron";
import {createClient, RedisClientType} from "redis";
import {EnvKey} from "./config/env";
import axios from "axios";
import {IWorker, WorkerConfig} from "./types";
import {Notification} from "./queues/Notification";
import {Worker} from 'bullmq';


const PORT = env(EnvKey.PORT)!;

(async () => {

    redisClient.on("connecting", () => {
        console.log("Redis Connecting...");
    })

    redisClient.on("connect", () => {
        console.log('Redis running on port - ', redisClient.options.port);
    });

    redisClient.on('error', (err) => {
        console.error('Redis connection error:', err);
    });

    const pubClient: RedisClientType = createClient({url: env(EnvKey.REDIS_URL)!});
    const subClient: RedisClientType = pubClient.duplicate();
    await Promise.all([pubClient.connect(), subClient.connect()]);

    const {server: app, io} = await createApp(pubClient, subClient);

    const workerConfig: WorkerConfig = {connection: {url: env(EnvKey.REDIS_URL)!}};

    const IWorkers: IWorker<any>[] = [
        new Notification(workerConfig, io),
    ];

    for (const IWorker of IWorkers) {
        const worker = new Worker(IWorker.queueName, IWorker.process.bind(IWorker), IWorker.config);
        if (IWorker.completed) worker.on('completed', IWorker.completed);
        if (IWorker.failed) worker.on('failed', IWorker.failed);
        if (IWorker.drained) worker.on('drained', IWorker.drained);
    }

    app.listen(PORT, () => console.log(`Server running on port - ${PORT}\n`));

})();

cron.schedule('*/10 * * * *', async () => {
    const response = await axios.get(`${env(EnvKey.MAIN_API)}/ping`);
    console.log(response.data);
});