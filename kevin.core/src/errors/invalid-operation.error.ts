import { KevinError, KevinErrorType } from "./kevin.error";

export class InvalidOperationError extends KevinError {
    constructor(message: string) {
        super(message, KevinErrorType.InvalidOperation);
    }
}