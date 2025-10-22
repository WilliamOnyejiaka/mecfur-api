import { Server, Socket } from "socket.io";

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
export const exchange = 'main_exchange';

export interface QueueConfig {
    name: string;
    durable: boolean;
    routingKeyPattern: string;
    exchange: string; // Dynamic exchange name for the queue
    handlers: Record<string, EventHandler<any>>;
}

export interface ISocket extends Socket {
    locals?: any
}