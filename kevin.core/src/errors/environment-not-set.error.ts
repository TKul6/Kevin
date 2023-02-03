export class EnvironmentNotSetError extends Error {
    constructor() {
        super("Environment is not set. Please set the environment using the setCurrentEnvironment method");
    }
}dvsfv