// src/utils/queue.ts
import { Queue, Worker } from 'bullmq';
import { sendEmail } from './email';
import IORedis from 'ioredis';

console.log(process.env.REDIS_URL , 'process.env.REDIS_URL')

const connection = new IORedis(process.env.REDIS_URL!, {
    retryStrategy: (times) => Math.min(times * 50, 2000), // Retry logic
    reconnectOnError: (err) => {
        console.error('Redis reconnecting due to error:', err);
        return true;
    },
});

console.log(connection, 'connection')

// Ensure Redis is connected before proceeding
connection.on('error', (err) => console.error('Redis connection error:', err));
connection.on('ready', () => console.log('Redis is ready'));

const queueName = 'emailQueue';

const emailQueue = new Queue(queueName, { connection });

const worker = new Worker(queueName, async (job) => {
    console.log(`Processing job ${job.id} of type ${job.name} with data:`, job.data);
    if (job.name === 'sendReminderEmail') {
        const { to, subject, template, context } = job.data;
        await sendEmail(to, subject, template, context);
    }
}, { connection }); // Pass 'connection' directly

worker.on('completed', (job) => {
    console.log(`Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed: ${err.message}`, err);
});

export const addEmailJob = async (name: string, data: any, delay: number = 0) => {
    await emailQueue.add(name, data, { delay });
};

const initEmailQueue = async () => {
    if (!connection.status || connection.status!== 'ready') {
        console.log('Waiting for Redis connection...');
        await new Promise((resolve) => {
            connection.once('ready', resolve);
        });
    }
    console.log('Email queue initialized.');
};

process.on('uncaughtException', (err) => {
    console.error('Unhandled Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

export { initEmailQueue };