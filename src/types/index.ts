import { Server, Socket } from "socket.io";
import { Job } from "bullmq";
import {QueueType} from "./constants";


export interface Cache { // TODO: use this only for users
    get: (key: string) => Promise<{ error: boolean; data?: any }>;
    set: (email: string, data: any) => Promise<boolean>;
}


export interface MatchFilters {
    religion?: string;
    education?: string;
    whatBringsYouHere?: string;
    lookingFor?: string[];
    minAge?: number;
    maxAge?: number;
    minHeight?: number;
    maxHeight?: number;
    maxDistance?: number;
    genderInterest?: string;
    hobbies?: string[];
    interests?: string[];
    pets?: string[];
    favoriteColors?: string[];
    spokenLanguages?: string[];
}

export interface UploadedImageData {
    mimeType: string;
    imageUrl: string;
    publicId: string;
    size: number;
}

export interface UploadResult {
    success: boolean;
    data?: Record<string, UploadedImageData>;
    error?: { fieldName: string; message: string }[];
    publicIds?: string[]
}

export interface UploadArrResult {
    success: boolean;
    data?: UploadedImageData[];
    error?: { fieldName: string; message: string }[];
    publicIds?: string[]
}


export type UploadedFiles = {
    publicId: string,
    size: string,
    url: string,
    mimeType: string,
    thumbnail: string | null,
    duration: string | null
};

export type FailedFiles = {
    filename: string,
    error: string
};


export type EventHandler<T> = (message: T, io: Server) => Promise<void> | void;

export interface WorkerConfig { connection: { url: string }, concurrency?: number, limiter?: { max: number, duration: number } }

export interface IWorker<T> {
    process: (job: Job<T>) => Promise<void>,
    completed?: (job: Job<any, void, string>, result: void, prev: string) => void,
    failed?: (job: Job<any, void, string> | undefined, error: Error, prev: string) => void,
    drained?: () => void,
    config: WorkerConfig,
    queueName: QueueType
}

export interface ISocket extends Socket {
    locals?: any
}