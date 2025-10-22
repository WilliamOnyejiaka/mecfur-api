import {DrizzleError} from "drizzle-orm";

interface ErrorResponse {
    status: number;
    message: string;
    details?: any;
}

export default class Service {

    public responseData(statusCode: number, error: boolean, message: string | null, data: any = {}) {
        return {
            statusCode: statusCode,
            json: {
                error: error,
                message: message,
                data: data
            }
        };
    }

    public handleDrizzleError(error: unknown) {
        // Default error response
        let response = {
            status: 500,
            message: 'An unexpected error occurred',
        };

        // Handle Drizzle-specific errors
        if (error instanceof DrizzleError) {
            switch (error.message) {
                case 'Database connection failed':
                    response = {
                        status: 503,
                        message: 'Failed to connect to the database',
                    };
                    break;
                case 'Query execution failed':
                    response = {
                        status: 400,
                        message: 'Invalid database query',
                    };
                    break;
                case 'Transaction failed':
                    response = {
                        status: 409,
                        message: 'Database transaction failed',
                    };
                    break;
                case 'Unique constraint violation':
                    response = {
                        status: 409,
                        message: 'Duplicate entry detected',
                    };
                    break;
                case 'Foreign key constraint violation':
                    response = {
                        status: 400,
                        message: 'Invalid reference to related data',
                    };
                    break;
                default:
                    response = {
                        status: 500,
                        message: error.message,
                    };
            }
        }
        // Handle TypeError for invalid timestamp values
        else if (error instanceof TypeError && error.message.includes('toISOString is not a function')) {
            response = {
                status: 400,
                message: 'Invalid timestamp value provided',
            };
        }
        // Handle generic JavaScript errors
        else if (error instanceof Error) {
            response = {
                status: 500,
                message: error.message,
            };
        }

        return this.responseData(response.status, true, response.message);
    }


}