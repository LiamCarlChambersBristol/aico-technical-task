export interface ErrorContext {
    type: string;
}

export class APIError extends Error {
    constructor(message: string, public context: ErrorContext) {
        super(message);
        this.name = "APIError";
    }
}