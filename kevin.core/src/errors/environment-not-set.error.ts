import { KevinError, KevinErrorType } from "./kevin.error";

export class EnvironmentNotSetError extends KevinError {
    constructor() {
        super("Environment is not set. Please set the environment using the setCurrentEnvironment method", KevinErrorType.EnvironmentNotSet);
    }
}