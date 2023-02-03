export class EnvironmentNotFoundError extends Error {
    constructor(public environmentId: string) {
        super("Environment not found");
    }
}