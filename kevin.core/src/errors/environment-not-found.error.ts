import { KevinError, KevinErrorType } from "./kevin.error";

export class EnvironmentNotFoundError extends KevinError {
    constructor(public environmentId: string) {
        super("Environment not found", KevinErrorType.EnvironmentNotFound);
    }
}