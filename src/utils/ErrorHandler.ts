import { Provider } from "../interfaces/IProviderConfig"

interface IError {
    statusCode: number;
    error: string[];
    data: any;
    success: boolean;
    provider: Provider;
    errorType: string;
}

export class ErrorHandler extends Error implements IError {
    public statusCode: number;
    public error: string[];
    public data: any;
    public success: boolean;
    public provider: Provider;
    public errorType: string;

    constructor( provider: Provider, errorType: string, message: string = "Something went wrong", statusCode: number = 500, error: string[] = [], stack?: string) {
        super(message);
        this.statusCode = statusCode;
        this.error = error;
        this.data = null;
        this.success = false;
        this.provider = provider
        this.errorType = errorType;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}