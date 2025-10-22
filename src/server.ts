import {createApp, env, redisClient} from "./config";
import cron from "node-cron";
import {createClient, RedisClientType} from "redis";
import {EnvKey} from "./config/env";
import axios from "axios";


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

    const pubClient: RedisClientType = createClient({ url: env(EnvKey.REDIS_URL)! });
    const subClient: RedisClientType = pubClient.duplicate();
    await Promise.all([pubClient.connect(), subClient.connect()]);

    const { server: app, io } = await createApp(pubClient, subClient);

    app.listen(PORT, () => console.log(`Server running on port - ${PORT}\n`));

})();

cron.schedule('*/10 * * * *', async ()=> {
    const response = await axios.get(`${env(EnvKey.MAIN_API)}/ping`);
    console.log(response.data);
});