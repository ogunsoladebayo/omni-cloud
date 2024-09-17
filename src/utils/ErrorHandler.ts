interface IError {
    statusCode: number;
    error: string[];
    data: any;
    success: boolean;
    provider: string;
}

class ErrorHandler extends Error implements IError {
    public statusCode: number;
    public error: string[];
    public data: any;
    public success: boolean;
    public provider: string;

    constructor( provider: string, message: string = "Something went wrong", statusCode: number = 500, error: string[] = [], stack?: string) {
        super(message);
        this.statusCode = statusCode;
        this.error = error;
        this.data = null;
        this.success = false;
        this.provider = provider

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export { ErrorHandler }