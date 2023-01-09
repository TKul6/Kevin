export class EnvironmentNotFoundError extends Error {
    constructor(public environmentName: string) {
        super("Environment not found");
    }
}